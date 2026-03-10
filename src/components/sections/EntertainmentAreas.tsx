import { useState } from "react"
import { Label } from "#/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { getEntertainmentAreas } from "#/utils/hue.functions";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group"

const EntertainmentAreas = () => {
    const [selected, setSelected] = useState<string>(
        () => localStorage.getItem("entertainment-area") ?? ""
    )

    const handleSelect = (value: string) => {
        localStorage.setItem("entertainment-area", value)
        setSelected(value)
    }
    const {
        isLoading,
        isError,
        error,
        data
    } = useQuery({ queryKey: ['entertainment-areas'], queryFn: getEntertainmentAreas })

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
        return <span>No areas found</span>
    }

    return (
        <RadioGroup value={selected} onValueChange={handleSelect}>
            {data.map((item: { id: string; name: string }) => (
                <div key={item.id} className="flex items-center gap-2">
                    <RadioGroupItem value={item.id} id={item.id} className="cursor-pointer" />
                    <Label htmlFor={item.id} className="cursor-pointer">{item.name}</Label>
                </div>
            ))}
        </RadioGroup>
    )
}

export default EntertainmentAreas