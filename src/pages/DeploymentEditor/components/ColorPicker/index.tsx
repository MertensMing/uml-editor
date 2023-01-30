import { SwatchesPicker } from "react-color";

export function ColorPicker(props: {
  onChange?: (color: string) => void;
  color?: string;
}) {
  return (
    <div>
      <SwatchesPicker onChange={(e) => props.onChange?.(e.hex)} />
    </div>
  );
}
