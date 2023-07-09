import JsonContent from "./components/JsonContent";
import Relations from "./components/Relations";
import { Comments } from "./components/Comments";
import { ObjectName } from "./components/ObjectName";
import { LineType } from "./components/LineType";

export const SideOperations = function () {
  return (
    <div>
      <LineType />
      <ObjectName />
      <JsonContent />
      <Comments />
      <Relations />
    </div>
  );
};
