import { ContainerObjectType } from "../../../../core/entities/Deployment";

export function AddContainer(props: {
  onClick(type: ContainerObjectType): void;
}) {
  return (
    <div className="space-x-4 flex">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 cursor-pointer hover:opacity-70"
        onClick={() => props.onClick(ContainerObjectType.rectangle)}
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M44.307 282.583C44.3056 227.804 38.8106 173.488 41.3864 118.667C43.0967 118.582 44.819 118.555 46.5285 118.456C149.748 112.476 253.118 123.336 356.075 118.421C362.503 171.535 362.997 228.982 359.323 282.355C260.877 289.213 161.475 281.861 62.8722 284"
            stroke="#000000"
            stroke-opacity="0.9"
            stroke-width="16"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
        </g>
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 cursor-pointer hover:opacity-70"
        onClick={() => props.onClick(ContainerObjectType.cloud)}
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M12.97 20H8.96997"
            stroke="#292D32"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
          <path
            d="M16.61 19.9999C17.95 20.0099 19.24 19.5099 20.23 18.6099C23.5 15.7499 21.75 10.0099 17.44 9.46995C15.9 0.129949 2.42998 3.66995 5.61998 12.5599"
            stroke="#292D32"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
          <path
            d="M7.28011 12.97C6.75011 12.7 6.16011 12.56 5.57011 12.57C0.910109 12.9 0.920108 19.68 5.57011 20.01"
            stroke="#292D32"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
          <path
            d="M15.8201 9.88998C16.3401 9.62998 16.9001 9.48998 17.4801 9.47998"
            stroke="#292D32"
            stroke-width="1.5"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
        </g>
      </svg>
    </div>
  );
}
