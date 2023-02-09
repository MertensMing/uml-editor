import { NormalObject, ObjectType } from "../../../../core/entities/Deployment";

export function AddObject(props: {
  onClick(type: NormalObject["type"]): void;
}) {
  return (
    <div className="flex flex-wrap max-w-xs">
      <svg
        viewBox="0 0 512 512"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 cursor-pointer hover:opacity-70 pr-3"
        onClick={() => props.onClick(ObjectType.circle)}
        fill="#000000"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <title>circle</title>{" "}
          <g
            id="Page-1"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 cursor-pointer hover:opacity-70 pr-3"
        onClick={() => props.onClick(ObjectType.json)}
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M14 19H16C17.1046 19 18 18.1046 18 17V14.5616C18 13.6438 18.6246 12.8439 19.5149 12.6213L21.0299 12.2425C21.2823 12.1794 21.2823 11.8206 21.0299 11.7575L19.5149 11.3787C18.6246 11.1561 18 10.3562 18 9.43845V5H14"
            stroke="#33363F"
            strokeWidth="2"
          ></path>{" "}
          <path
            d="M10 5H8C6.89543 5 6 5.89543 6 7V9.43845C6 10.3562 5.37541 11.1561 4.48507 11.3787L2.97014 11.7575C2.71765 11.8206 2.71765 12.1794 2.97014 12.2425L4.48507 12.6213C5.37541 12.8439 6 13.6438 6 14.5616V19H10"
            stroke="#33363F"
            strokeWidth="2"
          ></path>{" "}
        </g>
      </svg>
      <svg
        fill="#000000"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 cursor-pointer hover:opacity-70 pr-3"
        onClick={() => props.onClick(ObjectType.actor)}
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path d="M12,11A5,5,0,1,0,7,6,5.006,5.006,0,0,0,12,11Zm0-8A3,3,0,1,1,9,6,3,3,0,0,1,12,3ZM4,23H20a1,1,0,0,0,1-1A9,9,0,0,0,3,22,1,1,0,0,0,4,23Zm8-8a7.011,7.011,0,0,1,6.929,6H5.071A7.011,7.011,0,0,1,12,15Z"></path>
        </g>
      </svg>
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="#000000"
        strokeWidth="4"
        className="h-10 w-10 cursor-pointer hover:opacity-70 pr-3"
        onClick={() => props.onClick(ObjectType.database)}
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="1"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path d="M56 16v32c0 4.42-10.75 8-24 8S8 52.42 8 48V16c0-4.42 10.75-8 24-8s24 3.58 24 8z"></path>
          <path d="M56 16c0 4.42-10.75 8-24 8S8 20.42 8 16"></path>
          <path d="M56 32c0 4.42-10.75 8-24 8S8 36.42 8 32"></path>
        </g>
      </svg>
      <svg
        fill="#000000"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 88.332 88.333"
        stroke="#000000"
        stroke-width="0.353328"
        className="h-10 w-10 cursor-pointer hover:opacity-70 pr-3"
        onClick={() => props.onClick(ObjectType.usecase)}
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <g>
            {" "}
            <g>
              {" "}
              <path d="M44.166,75.062C19.812,75.062,0,61.202,0,44.167C0,27.13,19.812,13.27,44.166,13.27c24.354,0,44.166,13.859,44.166,30.896 C88.332,61.204,68.52,75.062,44.166,75.062z M44.166,16.27C21.467,16.27,3,28.784,3,44.167c0,15.381,18.467,27.896,41.166,27.896 s41.166-12.515,41.166-27.896C85.332,28.785,66.865,16.27,44.166,16.27z"></path>{" "}
            </g>{" "}
          </g>{" "}
        </g>
      </svg>
    </div>
  );
}
