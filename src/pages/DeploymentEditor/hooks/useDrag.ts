/* eslint-disable react-hooks/exhaustive-deps */
import React, { useLayoutEffect, useRef } from "react";
import { useDebounceCallback } from "@react-hook/debounce";
import { BaseObject } from "../../../core/entities/Deployment";

export function useDrag(
  divRef: React.MutableRefObject<HTMLDivElement>,
  onDrop?: (objectId: BaseObject["id"], targetId: BaseObject["id"]) => void
) {
  const ref = useRef({
    objectId: "",
    isDragging: false,
    clickOffsetX: 0,
    clickOffsetY: 0,
    text: "",
    now: 0,
  });

  const onEnd = useDebounceCallback(function (id: string) {
    onDrop?.(ref.current.objectId, id);
  }, 100);

  useLayoutEffect(() => {
    const target = document.getElementById("deployment-diagram");

    target.addEventListener("mousedown", function onmousedown(e: any) {
      const objectId = e.target?.attributes?.objectId?.value;
      if (objectId) {
        const { left, top } = e.target.getBoundingClientRect();
        const clickOffsetX = e.clientX - left;
        const clickOffsetY = e.clientY - top;
        ref.current.objectId = objectId;
        ref.current.isDragging = true;
        ref.current.clickOffsetX = clickOffsetX;
        ref.current.clickOffsetY = clickOffsetY;
        ref.current.text = e.target.textContent;
        ref.current.now = Date.now();
      }
    });
    document.addEventListener("mousemove", function onmousemove(e: any) {
      if (!ref.current.isDragging) return;
      const x = e.clientX - ref.current.clickOffsetX;
      const y = e.clientY - ref.current.clickOffsetY;
      divRef.current.style.top = `${y}px`;
      divRef.current.style.left = `${x}px`;
      divRef.current.textContent = ref.current.text;
      divRef.current.style.display = "block";
    });
    document.addEventListener("mouseup", function onmouseup(e: any) {
      ref.current.isDragging = false;
      divRef.current.style.display = "none";
      if (Date.now() - ref.current.now < 500) {
        return;
      }
      const objectId = e.target?.attributes?.objectId?.value;
      if (objectId) {
        onEnd(objectId);
      }
    });

    return () => {
      document.removeEventListener("mouseup", onmouseup);
      document.removeEventListener("mousemove", onmousemove);
      target.removeEventListener("mousedown", onmousedown);
    };
  }, []);

  return {
    refProps: {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        opacity: "0.5",
        display: "none",
        pointerEvents: "none",
      },
    },
  } as const;
}
