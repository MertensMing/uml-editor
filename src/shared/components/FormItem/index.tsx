/* eslint-disable react-hooks/exhaustive-deps */
import InputLabel from "@mui/material/InputLabel";
import React from "react";

export function FormItem(props: {
  label: string | React.ReactElement;
  content: string | React.ReactElement;
}) {
  return (
    <div>
      <br />
      <InputLabel
        style={{
          transform: "translate(0, -1.5px) scale(0.75)",
        }}
      >
        {props.label}
      </InputLabel>
      <div>{props.content}</div>
    </div>
  );
}
