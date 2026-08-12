import { locationOptions } from "@/lib/location-options";

type LocationInputProps = {
  name: string;
  listId: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  className: string;
};

export default function LocationInput({
  name,
  listId,
  defaultValue = "",
  placeholder,
  required = false,
  className,
}: LocationInputProps) {
  return (
    <>
      <input
        name={name}
        list={listId}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {locationOptions().map((location) => (
          <option key={location} value={location} />
        ))}
      </datalist>
    </>
  );
}
