import { useLayoutEffect, useRef, useState } from "react";
import { useDebounceCallback } from "@react-hook/debounce";
import { BaseObject } from "../../core/entities/Deployment";

export function useDrag(
  diagramId: string,
  onDrop?: (objectId: BaseObject["id"], targetId: BaseObject["id"]) => void,
  onSelect?: (objectId: BaseObject["id"]) => void
) {
  const ref = useRef({
    objectId: "",
    targetObjectId: "",
    isDragging: false,
    clickOffsetX: 0,
    clickOffsetY: 0,
    overX: 0,
    overY: 0,
    text: "",
    now: 0,
  });
  const divRef = useRef(document.createElement("div"));

  const boundEnd = useDebounceCallback(function (id: string) {
    onDrop?.(ref.current.objectId, id);
    ref.current.objectId = undefined;
    ref.current.targetObjectId = undefined;
  }, 100);

  function onStart(target: any, x: number, y: number) {
    let objectId = target?.attributes?.objectId?.value;
    if (
      !objectId &&
      target.nodeName === "text" &&
      `${target.parentNode.id}`.startsWith("elem_object") &&
      target.attributes.fill.value === "#000001"
    ) {
      objectId = `${target.parentNode.id}`.replace("elem_", "");
    }
    if (objectId) {
      const { left, top } = target.getBoundingClientRect();
      const clickOffsetX = x - left;
      const clickOffsetY = y - top;
      ref.current.objectId = objectId;
      ref.current.isDragging = true;
      ref.current.clickOffsetX = clickOffsetX;
      ref.current.clickOffsetY = clickOffsetY;
      ref.current.text = target.textContent;
      ref.current.now = Date.now();
      divRef.current.style.display = "none";
      divRef.current.style.position = "fixed";
      divRef.current.style.top = "0px";
      divRef.current.style.left = "0px";
      divRef.current.style.opacity = "0.5";
      divRef.current.style.pointerEvents = "none";
    }
  }

  function onEnd(objectId) {
    ref.current.isDragging = false;
    if (divRef.current) {
      divRef.current.style.display = "none";
    }
    if (Date.now() - ref.current.now < 800) {
      return;
    }
    if (objectId !== ref.current.objectId) {
      boundEnd(objectId);
    }
  }

  function onMove(clientX, clientY) {
    if (!ref.current.isDragging) return;
    const x = clientX - ref.current.clickOffsetX;
    const y = clientY - ref.current.clickOffsetY;
    if (divRef.current) {
      divRef.current.style.top = `${y}px`;
      divRef.current.style.left = `${x}px`;
      divRef.current.textContent = ref.current.text;
      divRef.current.style.display = "block";
    }
  }

  useLayoutEffect(() => {
    const target = document.getElementById(diagramId);
    document.body.appendChild(divRef.current);

    function onmousedown(e: any) {
      onStart(e.target, e.clientX, e.clientY);
      document.addEventListener("mousemove", onmousemove);
      document.addEventListener("mouseup", onmouseup);
    }

    function onmousemove(e: any) {
      onMove(e.clientX, e.clientY);
    }

    function onmouseup(e: any) {
      let objectId = e.target?.attributes?.objectId?.value;
      if (!objectId && `${e.target.parentNode.id}`.startsWith("elem_object")) {
        objectId = `${e.target.parentNode.id}`.replace("elem_", "");
      }
      onEnd(objectId);
      document.removeEventListener("mousemove", onmousemove);
      document.removeEventListener("mouseup", onmouseup);
    }

    function ontouchstart(e: any) {
      const objectId = e.touches[0].target?.attributes?.objectId?.value;
      if (objectId) {
        onSelect(objectId);
        e.preventDefault();
      }
      onStart(e.touches[0].target, e.touches[0].clientX, e.touches[0].clientY);
      document.addEventListener("touchmove", ontouchmove);
      document.addEventListener("touchend", ontouchend);
    }

    function ontouchmove(e) {
      const target = e.touches[0];
      ref.current.overX = target.clientX;
      ref.current.overY = target.clientY;
      onMove(target.clientX, target.clientY);
    }

    function ontouchend() {
      const hoveredElement = document.elementFromPoint(
        ref.current.overX,
        ref.current.overY
      );
      const objectId = (hoveredElement as any)?.attributes?.objectId?.value;
      onEnd(objectId);
      document.removeEventListener("touchmove", ontouchmove);
      document.removeEventListener("touchend", ontouchend);
    }

    target.addEventListener("mousedown", onmousedown);
    target.addEventListener("touchstart", ontouchstart);

    return () => {
      target.removeEventListener("mousedown", onmousedown);
      target.removeEventListener("touchstart", ontouchstart);
      document.body.removeChild(divRef.current);
    };
  }, []);
}
