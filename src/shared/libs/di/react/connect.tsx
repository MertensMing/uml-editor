import { createContext, useContext, useEffect, useRef } from "react";
import { Container } from "inversify";

export const context = createContext<Container>(new Container());

export function connect(Comp: React.ComponentType, factory: () => Container) {
  return (props) => {
    const parent = useContext(context);
    const container = useRef(factory()).current;

    useEffect(() => {
      container.parent = parent;
    }, [parent]);

    return (
      <context.Provider value={container}>
        <Comp {...props} />
      </context.Provider>
    );
  };
}
