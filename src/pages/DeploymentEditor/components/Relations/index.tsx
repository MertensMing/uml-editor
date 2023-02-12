import { StoreApi, useStore } from "zustand";
import shallow from "zustand/shallow";
import { findObject, RelationType } from "../../../../core/entities/Deployment";
import { ListStore } from "../../../../shared/store/listStore";
import { UndoStore } from "../../../../shared/store/undo";
import { pick } from "../../../../shared/utils/pick";
import { useEditDeploymentController } from "../../controller/useEditDeploymentController";
import { DeploymentStore } from "../../store/deploymentStore";
import { ColorPicker } from "../ColorPicker";

function Relations(props: {
  deploymentStore: StoreApi<DeploymentStore>;
  undoStore: StoreApi<UndoStore<any>>;
  listStore: StoreApi<ListStore>;
}) {
  const { deploymentStore, undoStore, listStore } = props;
  const { handleDeleteRelation, handleRelationChange } =
    useEditDeploymentController([deploymentStore, undoStore, listStore]);

  const { currentObjectId, deployment } = useStore(
    deploymentStore,
    (state) => pick(state, ["currentObjectId", "deployment"]),
    shallow
  );
  const relations = deployment?.relations?.[currentObjectId] ?? [];

  return (
    <>
      {relations?.length > 0 && (
        <div className="pt-8">
          <h3 className="pb-2 text-sm font-bold">对象关系</h3>
          <div className="-mb-5">
            {relations.map((item, idx) => {
              const to = findObject(deployment.root, item.to);
              return (
                <div className="pb-5 pt-2" key={idx}>
                  <div>
                    <div className="flex space-x-1 pb-2">
                      <div className="flex items-center mr-4">
                        <span className="mr-2 text-sm">连线</span>
                        <ColorPicker
                          color={item.linkColor || "#000000"}
                          onChange={(color) => {
                            handleRelationChange(
                              currentObjectId,
                              item.id,
                              "linkColor",
                              color
                            );
                          }}
                        />
                      </div>
                      <div className="flex items-center mr-4">
                        <span className="mr-2 text-sm">文字</span>
                        <ColorPicker
                          color={item.descColor || "#000000"}
                          onChange={(color) => {
                            handleRelationChange(
                              currentObjectId,
                              item.id,
                              "descColor",
                              color
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-control pb-2">
                      <label className="input-group input-group-sm">
                        <span>目标</span>
                        <span className="bg-slate-50">{to?.name}</span>
                      </label>
                    </div>
                    <div className="form-control pb-2">
                      <label className="input-group input-group-xs">
                        <span>描述</span>
                        <input
                          type="text"
                          className="input input-bordered input-xs w-36"
                          value={item.name}
                          onChange={(e) =>
                            handleRelationChange(
                              currentObjectId,
                              item.id,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="form-control pb-2">
                      <label className="input-group input-group-xs">
                        <span>类型</span>
                        <select
                          value={item.type}
                          className="select select-bordered select-xs"
                          onChange={(e) => {
                            handleRelationChange(
                              currentObjectId,
                              item.id,
                              "type",
                              e.target.value as RelationType
                            );
                          }}
                        >
                          <option value={RelationType.dependency}>依赖</option>
                          <option value={RelationType.association}>关联</option>
                          <option value={RelationType.composition}>组合</option>
                          <option value={RelationType.aggregation}>聚合</option>
                          <option value={RelationType.realize}>实现</option>
                          <option value={RelationType.generalization}>
                            继承
                          </option>
                        </select>
                      </label>
                    </div>
                    <div className="flex pb-2">
                      <div className="form-control">
                        <label className="input-group input-group-xs">
                          <span>方向</span>
                          <select
                            value={item.linkDirection}
                            className="select select-bordered select-xs"
                            onChange={(e) => {
                              handleRelationChange(
                                currentObjectId,
                                item.id,
                                "linkDirection",
                                (e.target.value === "-"
                                  ? ""
                                  : e.target.value) as any
                              );
                            }}
                          >
                            <option value={"up"}>上</option>
                            <option value={"down"}>下</option>
                            <option value={"left"}>左</option>
                            <option value={"right"}>右</option>
                            <option value={"-"}>自动</option>
                          </select>
                        </label>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteRelation(item.origin, item.to)
                        }
                        className="btn btn-ghost btn-error btn-xs ml-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default Relations;
