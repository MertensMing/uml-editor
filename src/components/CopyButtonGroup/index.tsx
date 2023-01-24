/* eslint-disable react-hooks/exhaustive-deps */
import Button from "@mui/material/Button";
import copy from "copy-to-clipboard";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import React from "react";

type Props = {
  uml: string;
  svg: string;
  png: string;
};

export function CopyButtonGroup(props: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Snackbar
        open={open}
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
      >
        <Alert severity="success">复制成功</Alert>
      </Snackbar>
      <Button
        variant="text"
        size="small"
        onClick={() => {
          const success = copy(props.uml);
          if (success) {
            setOpen(true);
            setTimeout(() => {
              setOpen(false);
            }, 1500);
          }
        }}
      >
        复制 PlantUML
      </Button>
      <Button href={props.svg} target="_blank" variant="text" size="small">
        下载 SVG
      </Button>
      <Button href={props.png} target="_blank" variant="text" size="small">
        下载 PNG
      </Button>
    </div>
  );
}
