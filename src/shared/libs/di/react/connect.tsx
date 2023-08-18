import { createContext, useContext, useRef, useState } from "react";
import { Container } from "inversify";

export const context = createContext<Container>(new Container());

export function connect(Comp: React.ComponentType, factory: () => Container) {
  return (props) => {
    const parent = useContext(context);
    const [container] = useState(() => {
      const result = factory();
      result.parent = parent;
      return result;
    });
    return (
      <context.Provider value={container}>
        <Comp {...props} />
      </context.Provider>
    );
  };
}
