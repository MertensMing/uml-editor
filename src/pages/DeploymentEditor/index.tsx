import { useEffect } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useParams } from "react-router-dom";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import {
  createDeploymentStore,
  deploymentStoreIdentifier,
} from "./store/deploymentStore";
import {
  createUndoStore,
  deploymentUndoStoreIdentifier,
} from "../../shared/store/undo";
import { listStore, listStoreIdentifier } from "../../shared/store/listStore";
import Diagram from "./components/Diagram";
import Toolbar from "./components/Toolbar";
import { Deployment } from "../../core/entities/Deployment";
import { connect } from "../../shared/libs/di/react/connect";
import { Container } from "inversify";
import { useService } from "../../shared/libs/di/react/useService";
import { db, PlantUMLEditorDatabaseIdentifier } from "../../db";
import { useDiagramController } from "./controller/useDiagramController";
import {
  useDiagramListService,
  useDiagramListServiceIdentifier,
} from "../../shared/services/useDiagramListService";
import {
  useDiagramService,
  UseDiagramServiceIdentifier,
} from "./service/useDiagramService";
import { Opreations } from "./components/Operations";

export const DeploymentEditor = connect(
  function () {
    const {
      handleDiagramInit,
      handleDiagramChange,
      handleDeleteDiagram,
      handleAddDiagram,
    } = useDiagramController([]);

    const deploymentStore = useService(deploymentStoreIdentifier);
    const { svgUrl, deployment, uml, pngUrl } = useStore(
      deploymentStore,
      (state) => pick(state, ["deployment", "svgUrl", "uml", "pngUrl"]),
      shallow
    );

    const { id } = useParams();

    useEffect(() => {
      handleDiagramInit();
    }, [id]);

    useEffect(() => {
      handleDiagramChange();
    }, [deployment]);

    return (
      <EditorLayout
        currentDiagram="deployment"
        uml={uml}
        pngUrl={pngUrl}
        svgUrl={svgUrl}
        onDelete={handleDeleteDiagram}
        onAdd={handleAddDiagram}
        diagram={<Diagram />}
        operation={<Opreations />}
        toolbar={<Toolbar />}
      />
    );
  },
  () => {
    const container = new Container();
    container
      .bind(deploymentStoreIdentifier)
      .toConstantValue(createDeploymentStore());
    container
      .bind(deploymentUndoStoreIdentifier)
      .toConstantValue(createUndoStore<Deployment>());
    container.bind(listStoreIdentifier).toConstantValue(listStore);
    container.bind(PlantUMLEditorDatabaseIdentifier).toConstantValue(db);
    container
      .bind(useDiagramListServiceIdentifier)
      .toConstantValue(useDiagramListService);
    container
      .bind(UseDiagramServiceIdentifier)
      .toConstantValue(useDiagramService);
    return container;
  }
);
