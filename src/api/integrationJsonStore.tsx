import { IIntegration, IStepProps, IViewProps } from '../types';
import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import create from 'zustand';

interface IIntegrationJsonStore {
  addStep: (newStep: IStepProps) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  integrationJson: IIntegration;
  updateIntegration: (newInt?: any) => void;
  replaceStep: (newStep: IStepProps, oldStepIndex?: number) => void;
  setViews: (views: IViewProps[]) => void;
  views: IViewProps[];
}

const initialIntegration: IIntegration = {
  metadata: { name: 'integration', dsl: 'KameletBinding', namespace: 'default' },
  steps: [],
  params: [],
};

/**
 * Regenerate a UUID for a list of Steps
 * Every time there is a change to steps or their positioning in the Steps array,
 * their UUIDs need to be regenerated
 * @param steps
 */
function regenerateUuids(steps: IStepProps[]) {
  const newSteps = steps.slice();
  newSteps.map((step, idx) => {
    step.UUID = step.name + idx;
  });
  return newSteps;
}

export const useIntegrationJsonStore = create<IIntegrationJsonStore>((set, get) => ({
  integrationJson: initialIntegration,
  addStep: (newStep) => {
    let newSteps = get().integrationJson.steps.slice();
    // manually generate UUID for the new step
    newStep.UUID = newStep.name + newSteps.length;
    newSteps.push(newStep);
    set((state) => {
      return {
        integrationJson: {
          ...state.integrationJson,
          steps: newSteps,
        },
      };
    });
  },
  deleteIntegration: () => set({ integrationJson: { ...initialIntegration, steps: [] } }),
  deleteStep: (stepIdx) => {
    let stepsCopy = get().integrationJson.steps.slice();
    const updatedSteps = stepsCopy.filter((_step: any, idx: any) => idx !== stepIdx);
    const stepsWithNewUuids = regenerateUuids(updatedSteps);
    set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: stepsWithNewUuids,
      },
    }));
  },
  replaceStep: (newStep, oldStepIndex) => {
    let newSteps = get().integrationJson.steps.slice();
    if (oldStepIndex === undefined) {
      // replacing a slot step with no pre-existing step
      console.log('empty slot');
      newSteps.unshift(newStep);
    } else {
      // replacing an existing step
      console.log('existing step');
      newSteps[oldStepIndex] = newStep;
    }
    const stepsWithNewUuids = regenerateUuids(newSteps);

    return set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: stepsWithNewUuids,
      },
    }));
  },
  setViews: (viewData: IViewProps[]) => {
    set({ views: viewData });
  },
  updateIntegration: (newInt) => {
    let newIntegration = { ...get().integrationJson, ...newInt };
    newIntegration.steps = regenerateUuids(newIntegration.steps);
    return set({ integrationJson: { ...newIntegration } });
  },
  views: [],
}));

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('integrationJsonStore', useIntegrationJsonStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}
