import { getAvailableBridges, registerWithBridge } from "#/utils/hue.functions"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

type BridgeDiscoveryProps = {
    onClose: () => void
}

const BridgeDiscovery = ({ onClose }: BridgeDiscoveryProps) => {
    const [isRegistered, setIsRegistered] = useState<string | null >(null)
    const { 
        isLoading,
        isError,
        data
    } = useQuery({ queryKey: ['bridges'], queryFn: getAvailableBridges, enabled: !isRegistered })

    useEffect(() => {
       const rawValue = localStorage.getItem("bridge-reg")

       setIsRegistered(rawValue)
    }, [])

    if ((isRegistered?.length || -1) > 0) {
        const currentIp = JSON.parse(isRegistered!).ip
        return <span>Actively Paired with bridge at {currentIp}</span>
    }



    if (isError) {
        return <span>Something went wrong fetching Hue Bridges!</span>
    }

    if (isLoading) {
        return <span>loading...</span>
    }

    if (data.length === 0) {
        return <span>No bridges found on the local network!</span>
    }    

    return (
     <ul>
        {data.map(item => (
            <li>
                {item.id} ({item.ip})
                
                <Button 
                    size="xs" 
                    className="cursor-pointer" 
                    onClick={() => registerWithBridge({ data: { ip: item.ip } })
                        .catch(() => alert("Press the button on the bridge and then click connect within 30s"))
                        .then((credentials) => {
                            localStorage.setItem("bridge-reg", JSON.stringify({ id: item.id, ip: item.ip, credentials}))
                            onClose?.()
                            alert("Bridge paired succesfully!")
                        })
                    }
                >
                    Connect
                </Button>
            </li>
        ))}
     </ul>   
    )
}


export default BridgeDiscovery
