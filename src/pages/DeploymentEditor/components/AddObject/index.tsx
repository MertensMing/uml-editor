import { NormalObject, ObjectType } from "../../../../core/entities/Deployment";

export function AddObject(props: {
  onClick(type: NormalObject["type"]): void;
}) {
  return (
    <div className="space-x-4 flex">
      <svg
        viewBox="0 0 512 512"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 cursor-pointer hover:opacity-70"
        onClick={() => props.onClick(ObjectType.circle)}
        fill="#000000"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <title>circle</title>{" "}
          <g
            id="Page-1"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            {" "}
            <g
              id="icon"
              fill="#000000"
              transform="translate(42.666667, 42.666667)"
            >
              {" "}
              <path
                d="M213.333333,3.55271368e-14 C331.15408,3.55271368e-14 426.666667,95.5125867 426.666667,213.333333 C426.666667,331.15408 331.15408,426.666667 213.333333,426.666667 C95.5125867,426.666667 3.55271368e-14,331.15408 3.55271368e-14,213.333333 C3.55271368e-14,95.5125867 95.5125867,3.55271368e-14 213.333333,3.55271368e-14 Z M213.333333,42.6666667 C119.076736,42.6666667 42.6666667,119.076736 42.6666667,213.333333 C42.6666667,307.589931 119.076736,384 213.333333,384 C307.589931,384 384,307.589931 384,213.333333 C384,119.076736 307.589931,42.6666667 213.333333,42.6666667 Z"
                id="Combined-Shape"
              >
                {" "}
              </path>{" "}
            </g>{" "}
          </g>{" "}
        </g>
      </svg>
    </div>
  );
}
