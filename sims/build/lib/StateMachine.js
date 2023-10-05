export function updateStateMachine(machine, args) {
    const transition = machine.edges.find((t) => t.fromStateName === machine.current && t.shouldTransition(args));
    if (!transition) {
        return machine;
    }
    return {
        ...machine,
        current: transition.toStateName,
    };
}
