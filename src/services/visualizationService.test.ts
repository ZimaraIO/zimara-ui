import branchSteps from '../store/data/branchSteps';
import nodes from '../store/data/nodes';
import steps from '../store/data/steps';
import { VisualizationService } from './visualizationService';
import { IStepProps, IStepPropsBranch, IVizStepNode, IVizStepNodeData } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { MarkerType, Position } from 'reactflow';

describe('visualizationService', () => {
  const groupWidth = 80;
  const baseStep = { UUID: '', name: '', maxBranches: 0, minBranches: 0, type: '' };

  /**
   * buildBranchNodeParams
   */
  it('buildBranchNodeParams(): should build params for a branch node', () => {
    const currentStep = steps[3];
    const nodeId = 'node_example-1234';

    expect(VisualizationService.buildBranchNodeParams(currentStep, nodeId, 'RIGHT')).toEqual({
      data: {
        kind: currentStep.kind,
        label: truncateString(currentStep.name, 14),
        step: currentStep,
        icon: currentStep.icon,
      },
      id: nodeId,
      position: { x: 0, y: 0 },
      draggable: false,
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
      type: 'step',
    });

    // Check that the `sourcePosition` and `targetPosition` change with the layout
    expect(VisualizationService.buildBranchNodeParams(currentStep, nodeId, 'DOWN')).toEqual({
      data: {
        kind: currentStep.kind,
        label: truncateString(currentStep.name, 14),
        step: currentStep,
        icon: currentStep.icon,
      },
      id: nodeId,
      position: { x: 0, y: 0 },
      draggable: false,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: 'step',
    });
  });

  it('buildBranchSingleStepEdges(): should build edges before and after a branch with only one step', () => {
    const node = {
      data: {
        step: {
          branches: [
            {
              steps: [{ UUID: 'single-step' }],
            },
          ],
        },
      },
    } as IVizStepNode;
    const rootNode = {} as IVizStepNode;
    const rootNodeNext = {} as IVizStepNode;
    expect(
      VisualizationService.buildBranchSingleStepEdges(node, rootNode, rootNodeNext)
    ).toHaveLength(2);
  });

  /**
   * buildEdgeParams
   */
  it("buildEdgeParams(): should build an edge's default parameters for a single given node", () => {
    const currentStep = nodes[1];
    const previousStep = nodes[0];

    expect(VisualizationService.buildEdgeParams(currentStep, previousStep)).toEqual({
      arrowHeadType: 'arrowclosed',
      id: 'e-' + currentStep.id + '>' + previousStep.id,
      markerEnd: {
        type: MarkerType.Arrow,
      },
      source: currentStep.id,
      target: previousStep.id,
      type: 'default',
    });
  });

  /**
   * buildEdges
   */
  it('buildEdges(): should build an edge for every node except the first, given an array of nodes', () => {
    const nodes = [
      {
        data: {
          label: 'aws-kinesis-source',
          step: { ...baseStep, UUID: 'example-1234' },
          nextStepUuid: 'example-1235',
        },
        id: 'dndnode_1',
        position: { x: 720, y: 250 },
      },
      {
        data: { label: 'avro-deserialize-sink', step: { ...baseStep, UUID: 'example-1235' } },
        id: 'dndnode_2',
        position: { x: 880, y: 250 },
      },
    ];

    expect(VisualizationService.buildEdges(nodes)).toHaveLength(1);

    // let's test that it works for branching too
    const stepNodes = VisualizationService.buildNodesFromSteps(branchSteps, 'RIGHT');

    expect(VisualizationService.buildEdges(stepNodes)).toHaveLength(branchSteps.length - 1);
  });

  /**
   * buildNodeDefaultParams
   */
  it('buildNodeDefaultParams(): should build the default parameters for a single node, given a step', () => {
    const position = { x: 0, y: 0 };
    const step = { name: 'avro-deserialize-action', icon: '', kind: 'Kamelet' } as IStepProps;

    expect(VisualizationService.buildNodeDefaultParams(step, 'dummy-id', position)).toEqual({
      data: {
        branchInfo: undefined,
        icon: step.icon,
        isPlaceholder: false,
        kind: step.kind,
        label: truncateString(step.name, 14),
        step,
        x: 0,
        y: 0,
      },
      id: 'dummy-id',
      draggable: false,
      height: 80,
      position: { x: 0, y: 0 },
      type: 'step',
      width: 80,
      x: 0,
      y: 0,
    });
  });

  /**
   * buildNodesFromSteps
   */
  it('buildNodesFromSteps(): should build visualization nodes from an array of steps', () => {
    const stepNodes = VisualizationService.buildNodesFromSteps(steps, 'RIGHT');
    expect(stepNodes[0].data.step.UUID).toBeDefined();
    expect(stepNodes[0].id).toContain(stepNodes[0].data.step.UUID);
  });

  /**
   * buildNodesFromSteps for integrations with branches
   */
  it.skip('buildNodesFromSteps(): should build visualization nodes from an array of steps with branches', () => {
    const stepNodes = VisualizationService.buildNodesFromSteps(branchSteps, 'RIGHT');
    expect(stepNodes[0].data.step.UUID).toBeDefined();
    expect(stepNodes).toHaveLength(branchSteps.length);
  });

  /**
   * containsAddStepPlaceholder
   */
  it('containsAddStepPlaceholder(): should determine if there is an ADD STEP placeholder in the steps', () => {
    const nodes = [
      {
        data: {
          label: 'ADD A STEP',
          step: baseStep,
        },
        id: 'dndnode_1',
        position: { x: 500, y: 250 },
      },
      {
        data: {
          label: 'avro-deserialize-sink',
          step: baseStep,
        },
        id: 'dndnode_2',
        position: { x: 660, y: 250 },
      },
    ];

    expect(VisualizationService.containsAddStepPlaceholder(nodes)).toBe(true);

    expect(
      VisualizationService.containsAddStepPlaceholder([
        {
          data: {
            label: 'avro-deserialize-sink',
            step: baseStep,
          },
          id: 'dndnode_2',
          position: { x: 660, y: 250 },
        },
      ])
    ).toBe(false);
  });

  /**
   * findNodeIdxWithUUID
   */
  it('findNodeIdxWithUUID(): should find a node from an array of nodes, given a UUID', () => {
    expect(VisualizationService.findNodeIdxWithUUID(nodes[0].data.step.UUID, nodes)).toBe(0);
    expect(VisualizationService.findNodeIdxWithUUID(nodes[1].data.step.UUID, nodes)).toBe(1);
  });

  /**
   * insertAddStepPlaceholder
   */
  it('insertAddStepPlaceholder(): should add an ADD STEP placeholder to the beginning of the array', () => {
    const nodes: IVizStepNode[] = [];
    VisualizationService.insertAddStepPlaceholder(nodes, '', 'START', { nextStepUuid: '' });
    expect(nodes).toHaveLength(1);
  });

  /**
   * insertBranchGroupNode
   */
  it.skip('insertBranchGroupNode', () => {
    const nodes: IVizStepNode[] = [];
    VisualizationService.insertBranchGroupNode(nodes, { x: 0, y: 0 }, 150, groupWidth);
    expect(nodes).toHaveLength(1);
  });

  /**
   * shouldAddEdge
   */
  it('shouldAddEdge(): given a node, should determine whether to add an edge for it', () => {
    const nodeWithoutBranches = {
      id: 'node-without-branches',
      data: { label: '', step: { UUID: '' } },
    } as IVizStepNode;

    const nextNode = {
      id: 'next-node',
      data: {
        label: 'Next Node',
        step: { UUID: '' },
      },
    } as IVizStepNode;

    // there is no next node, so it should be false
    expect(VisualizationService.shouldAddEdge(nodeWithoutBranches)).toBeFalsy();
    expect(VisualizationService.shouldAddEdge(nodeWithoutBranches, nextNode)).toBeTruthy();

    const nodeWithBranches = {
      id: 'node-with-branches',
      data: {
        step: {
          branches: [
            {
              identifier: 'branch-1',
              steps: [{ UUID: 'abcd', name: 'abcd' }],
            },
            {
              identifier: 'branch-2',
              steps: [{ UUID: 'efgh', name: 'efgh' }],
            },
          ],
        },
      },
    } as IVizStepNode;

    // there is no next node, so it should be false
    expect(VisualizationService.shouldAddEdge(nodeWithBranches)).toBeFalsy();

    // it has branches with steps, so it should be false because
    // the steps will connect with the next step later on
    expect(VisualizationService.shouldAddEdge(nodeWithBranches, nextNode)).toBeFalsy();

    const nodeWithEmptyBranch = {
      id: 'node-with-empty-branch',
      data: {
        step: {
          branches: [
            {
              identifier: 'branch-1',
              steps: [],
            },
            {
              identifier: 'branch-2',
              steps: [],
            },
          ],
        },
      },
    } as IVizStepNode;

    // there is no next node, so it should be false
    expect(VisualizationService.shouldAddEdge(nodeWithEmptyBranch)).toBeFalsy();
    expect(VisualizationService.shouldAddEdge(nodeWithoutBranches, nextNode)).toBeTruthy();
  });

  it('showAppendStepButton(): given a node, should determine whether to show an append step button for it', () => {
    // it cannot be an END step, it must be the last step in the array,
    // OR it must support branching & contain at least one step
    const stepWithNoBranch: IVizStepNodeData = {
      label: '',
      isLastStep: true,
      step: {} as IStepProps,
    };

    // is the last step, is an end step, no branching support
    expect(VisualizationService.showAppendStepButton(stepWithNoBranch, true)).toBeFalsy();

    // is the last step, is not an end step, no branching support
    expect(VisualizationService.showAppendStepButton(stepWithNoBranch, false)).toBeTruthy();

    const lastStepWithBranch: IVizStepNodeData = {
      label: '',
      isLastStep: true,
      step: {
        branches: [{}] as IStepPropsBranch[],
        maxBranches: -1,
        minBranches: 0,
      } as IStepProps,
    };

    // is last step, is an end step, supports branching
    expect(VisualizationService.showAppendStepButton(lastStepWithBranch, true)).toBeTruthy();

    // is last step, is not an end step, supports branching
    expect(VisualizationService.showAppendStepButton(lastStepWithBranch, false)).toBeTruthy();

    // is not the last step, is not an end step, supports branching
    expect(
      VisualizationService.showAppendStepButton(
        {
          ...lastStepWithBranch,
          isLastStep: false,
        },
        false
      )
    ).toBeTruthy();

    // a trick step at the end of an array, an END step, with a branches array but no min/max branching.
    // NOTE: this is unlikely to happen, but added for catching edge cases
    expect(
      VisualizationService.showAppendStepButton(
        { isLastStep: true, step: { branches: [{}] as IStepPropsBranch[] } } as IVizStepNodeData,
        true
      )
    ).toBeFalsy();
  });

  it('showPrependStepButton(): given a node, should determine whether to show a prepend step button for it', () => {
    // it cannot be an end step, and it must be a first step
    const node: IVizStepNodeData = {
      label: '',
      isFirstStep: true,
      step: {} as IStepProps,
    };

    // is a first step, is an end step
    expect(VisualizationService.showPrependStepButton(node, true)).toBeFalsy();

    // is a first step, is not an end step
    expect(VisualizationService.showPrependStepButton(node, false)).toBeTruthy();

    // is not a first step, is not an end step
    expect(
      VisualizationService.showPrependStepButton({ ...node, isFirstStep: false }, false)
    ).toBeFalsy();

    // is not a first step, is an end step
    expect(
      VisualizationService.showPrependStepButton({ ...node, isFirstStep: false }, true)
    ).toBeFalsy();
  });
});
