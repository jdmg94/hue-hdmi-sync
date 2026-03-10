import { useQuery } from "@tanstack/react-query";
import { Label } from "#/components/ui/label";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import { usePersistedState } from "#/hooks/usePersistedState";
import { getVideoInputs } from "#/lib/hue.functions";

const VideoInputs = () => {
    const [selected, setSelected] = usePersistedState("video-input", "")
    const {
        isLoading,
        isError,
        error,
        data
    } = useQuery({ queryKey: ['video-inputs'], queryFn: getVideoInputs })

    if (isError) {
        return (
            <span>
                <span>Something went wrong...</span>
                <br />
                {error?.message}
            </span>
        )
    }

    if (isLoading) {
        return <span>loading...</span>
    }

    if (!data || data.length === 0) {
        return <span>No inputs found</span>
    }

    return (
        <RadioGroup value={selected} onValueChange={setSelected}>
            {data.map((item: { id: string; name: string }) => (
                <div key={item.id} className="flex items-center gap-2">
                    <RadioGroupItem value={item.id} id={item.id} className="cursor-pointer" />
                    <Label htmlFor={item.id} className="cursor-pointer">{item.name}</Label>
                </div>
            ))}
        </RadioGroup>
    )
}

export default VideoInputs