export interface StateMachine<States extends string> {
  nodes: States[];
  edges: StateTransition<States>[];
  current: States;
}

export interface StateTransition<States> {
  fromStateName: States;
  toStateName: States;
  shouldTransition: (roll: number) => Boolean;
}

export function updateStateMachine(machine: StateMachine<any>, args: number) {
  const transition = machine.edges.find(
    (t) => t.fromStateName === machine.current && t.shouldTransition(args)
  );
  if (!transition) {
    return machine;
  }
  return {
    ...machine,
    current: transition.toStateName,
  };
}
