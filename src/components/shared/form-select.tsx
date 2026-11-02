"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

type Props = {
    id?: string;
    name: string;
    options: SelectOption[];
    defaultValue?: string;
    placeholder?: string;
    invalid?: boolean;
};

export function FormSelect({ id, name, options, defaultValue, placeholder, invalid }: Props) {
    return (
        <Select name={name} items={options} defaultValue={defaultValue ?? null}>
            <SelectTrigger id={id} className="w-full font-light" aria-invalid={invalid}>
                <SelectValue placeholder={placeholder ?? "Pilih"} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
