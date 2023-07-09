import { lazy, useEffect, Suspense } from "react";
import { useStore } from "zustand";
import shallow from "zustand/shallow";
import { useParams } from "react-router-dom";
import { EditorLayout } from "../../shared/components/EditorLayout";
import { pick } from "../../shared/utils/pick";
import {
  createDeploymentStore,
  deploymentStoreIdentifier,
} from "./store/deploymentStore";
import { listStore, listStoreIdentifier } from "../../shared/store/listStore";
import Diagram from "./components/Diagram";
import Toolbar from "./components/Toolbar";
import { connect } from "../../shared/libs/di/react/connect";
import { Container } from "inversify";
import {
  useAsyncService,
  useService,
} from "../../shared/libs/di/react/useService";
import { db, PlantUMLEditorDatabaseIdentifier } from "../../db";
import { useDiagramController } from "./controller/useDiagramController";
import {
  useDiagramListService,
  UseDiagramListServiceIdentifier,
} from "../../shared/service/useDiagramListService";
import {
  useDiagramService,
  UseDiagramServiceIdentifier,
} from "./service/useDiagramService";
import {
  message,
  MessageIdentifier,
  modal,
  ModalIdentifier,
} from "./components/antd";

const SideOperations = lazy(() => import("./components/SideOperations"));

export const DeploymentEditor = connect(
  function () {
    const {
      handleDiagramInit,
      handleDiagramChange,
      handleDeleteDiagram,
      handleAddDiagram,
    } = useDiagramController([]);
    const modalService = useAsyncService(ModalIdentifier);

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
        onDelete={() => {
          modalService().then((res) => {
            res.default.confirm({
              cancelText: "取消",
              okText: "确认",
              content: "确认删除吗？",
              title: "提醒",
              onOk: handleDeleteDiagram,
              okButtonProps: {
                danger: true,
              },
              centered: true,
            });
          });
        }}
        onAdd={handleAddDiagram}
        diagram={<Diagram />}
        operation={
          <Suspense fallback={<div style={{ width: "200px" }}>loading...</div>}>
            <SideOperations />
          </Suspense>
        }
        toolbar={<Toolbar />}
      />
    );
  },
  () => {
    const container = new Container();
    container
      .bind(deploymentStoreIdentifier)
      .toConstantValue(createDeploymentStore());
    container.bind(listStoreIdentifier).toConstantValue(listStore);
    container.bind(PlantUMLEditorDatabaseIdentifier).toConstantValue(db);
    container
      .bind(UseDiagramListServiceIdentifier)
      .toConstantValue(useDiagramListService);
    container
      .bind(UseDiagramServiceIdentifier)
      .toConstantValue(useDiagramService);
    container.bind(ModalIdentifier).toProvider(() => {
      return () => {
        return modal;
      };
    });
    container.bind(MessageIdentifier).toProvider(() => {
      return () => message;
    });
    return container;
  }
);
