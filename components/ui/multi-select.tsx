"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  allowCustom?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  allowCustom = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = e.target as HTMLInputElement
    if (
      e.key === "Enter" &&
      allowCustom &&
      inputValue &&
      !options.includes(inputValue) &&
      !selected.includes(inputValue)
    ) {
      e.preventDefault()
      onChange([...selected, inputValue])
      setInputValue("")
    }

    if (e.key === "Backspace" && !input.value && selected.length > 0) {
      onChange(selected.slice(0, -1))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white",
            className,
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && <span className="text-slate-400">{placeholder}</span>}
            {selected.map((item) => (
              <Badge
                variant="secondary"
                key={item}
                className="mr-1 mb-1 bg-slate-700 hover:bg-slate-600 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(item)
                }}
              >
                {item}
                <X className="ml-1 h-3 w-3 text-slate-400 hover:text-white" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-slate-800 border-slate-700 text-white">
        <Command className="bg-slate-800 text-white">
          <CommandInput
            placeholder="Search..."
            className="h-9 text-white"
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2 text-slate-400">
              {allowCustom ? (
                <div className="flex justify-between items-center">
                  <span>No item found.</span>
                  {inputValue && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      onClick={() => {
                        onChange([...selected, inputValue])
                        setInputValue("")
                      }}
                    >
                      Add "{inputValue}"
                    </Button>
                  )}
                </div>
              ) : (
                "No item found."
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(
                      selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option],
                    )
                    setOpen(true)
                  }}
                  className="text-white hover:bg-slate-700"
                >
                  <Check className={cn("mr-2 h-4 w-4", selected.includes(option) ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
