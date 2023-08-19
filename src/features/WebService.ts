import Koa from "koa"
import Boom from "@hapi/boom"
import bodyParser from "koa-body"
import KoaRouter from "@koa/router"
import Bonjour from "@homebridge/ciao"
import { Worker } from "worker_threads"
import HueSync, { EntertainmentArea } from "hue-sync"

import chunk from "../utils/chunk"
import sleep from "../utils/sleep"
import {
  persistNewCredentials,
  getRegisteredCredentials,
} from "../utils/credentialHelpers"

type HueWebState = {
  isActive: boolean
  bridge?: HueSync
  entertainmentArea?: EntertainmentArea
}

async function init(port = 8080) {
  const app = new Koa()
  const router = new KoaRouter()
  const bonjour = Bonjour.getResponder()
  const worker = new Worker("./build/CVWorker")
  let credentials = await getRegisteredCredentials()

  const state: HueWebState = {
    isActive: false,
    bridge: undefined,
    entertainmentArea: undefined,
  }

  app.use(bodyParser())
  app.use(router.routes())
  app.use(
    router.allowedMethods({
      throw: true,
      notImplemented: () => Boom.notImplemented(),
      methodNotAllowed: () => Boom.methodNotAllowed(),
    })
  )

  const broadcast = bonjour.createService({
    port,
    name: "Hue HDMI Sync",
    type: "hue-hdmi-sync",
  })

  worker.on("message", (message) => {
    const colorData = chunk<number>(message, 3)

    state.bridge!.transition(colorData as Array<[number, number, number]>)
  })

  router.get("/check", async (context) => {
    let status = "NOT_READY"

    if (state.bridge && credentials) {
      status = "IDLE"

      if (state.isActive) {
        status = "RUNNING"
      }
    }

    context.body = {
      status,
    }
  })

  router.get("/discovery", async (context) => {
    const devices = await HueSync.discover()

    context.body = devices
  })

  router.post("/register", async (context) => {
    const ip = context.request.body.ip
    const name = context.request.body.name || "hue-hdmi-sync"

    const nextCredentials = await HueSync.register(ip, name)

    await persistNewCredentials(nextCredentials)

    credentials = nextCredentials

    context.body = {
      status: "IDLE",
    }
  })

  router.get("/entertainment-areas", async (context) => {
    if (!state.bridge) {
      const notInitializedException =
        Boom.preconditionFailed("Not Initialized!").output

      context.status = notInitializedException.statusCode
      context.body = {
        status: "ERROR",
        payload: notInitializedException.payload,
      }
    } else {
      const data = await state.bridge?.getEntertainmentAreas()

      context.body = data
    }
  })

  router.get("/stream/:id", async (context) => {
    if (!state.bridge) {
      const notReadyException = Boom.preconditionFailed(
        "Not Ready to Stream!"
      ).output

      context.status = notReadyException.statusCode
      context.body = {
        status: "ERROR",
        payload: notReadyException.payload,
      }
    } else {
      const area = await state.bridge?.getEntertainmentArea(context.params.id)

      await state.bridge.start(area)
      worker.postMessage("start")

      state.isActive = true
      context.body = {
        status: "RUNNING",
      }
    }
  })

  router.get("/stop", async (context) => {
    const noSocketException = Boom.preconditionFailed("No Active Stream!")
    if (!state.bridge) {
      context.status = noSocketException.output.statusCode
      context.body = noSocketException.output.payload
      return
    }

    try {
      worker.postMessage("stop")
      await sleep(500)
      state.bridge?.stop()

      state.isActive = false
      context.body = {
        status: "IDLE",
      }
    } catch {
      context.status = noSocketException.output.statusCode
      context.body = noSocketException.output.payload
    }
  })

  router.get("/quick-start", async (context) => {
    const [device] = await HueSync.discover()
    state.bridge = new HueSync({
      credentials,
      id: device.id,
      url: device.internalipaddress!,
    })

    context.body = {
      status: "IDLE",
    }
  })

  app.listen(port)
  broadcast.advertise()
  console.log(`listening on port ${port}!`)
}

init()
