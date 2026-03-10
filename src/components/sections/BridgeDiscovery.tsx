import { useQuery } from "@tanstack/react-query"
import { usePersistedState } from "#/hooks/usePersistedState"
import { getAvailableBridges, registerWithBridge } from "#/lib/hue.functions"
import { Button } from "../ui/button"

type BridgeDiscoveryProps = {
    onClose: () => void
}

const BridgeDiscovery = ({ onClose }: BridgeDiscoveryProps) => {
    const [registration, updateRegistration] = usePersistedState<HueBridgeRegistration>("bridge-reg", undefined)    
    const { 
        isLoading,
        isError,
        data
    } = useQuery({ queryKey: ['bridges'], queryFn: getAvailableBridges, enabled: () => !registration || registration.length === 0 })

    if (registration) {
        return <span>Actively Paired with bridge {registration.name} at {registration.ip}</span>
    }

    if (isError) {
        return <span>Something went wrong fetching Hue Bridges!</span>
    }

    if (isLoading) {
        return <span>loading...</span>
    }

    if (data?.length === 0) {
        return <span>No bridges found on the local network!</span>
    }    

    return (
     <ul>
        {data?.map(item => (
            <li key={item.id}>
                {item.id}
                {" "}
                ({item.ip})
                {" "}
                <Button 
                    size="xs" 
                    className="cursor-pointer" 
                    onClick={() => registerWithBridge({ data: { ip: item.ip, id: item.id, name: item.name } })
                        .catch((err) => {
                            console.debug("error from bridge registration: ", err.message)
                            alert("Press the button on the bridge and then click connect within 30s")

                        })
                        .then((credentials) => {
                            if (credentials) {
                                updateRegistration({ id: item.id, ip: item.ip, credentials })
                                onClose?.()
                                alert("Bridge paired succesfully!")
                            }
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
