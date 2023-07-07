import { createContext, useRef } from "react";
import { Container } from "inversify";

export const context = createContext<Container>(new Container());

export function connect(Comp: React.ComponentType, factory: () => Container) {
  return (props) => {
    const container = useRef(factory()).current;
    return (
      <context.Provider value={container}>
        <Comp {...props} />
      </context.Provider>
    );
  };
}
