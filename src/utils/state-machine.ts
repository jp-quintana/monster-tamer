interface State {
  name: string;
  onEnter?: () => void;
}

export class StateMachine {
  private states: Map<string, State>;
  private currentState: State | undefined;
  private isChangingState: boolean;
  private changingStateQueue: string[];
  constructor(private id: string, private context?: object | undefined) {
    this.isChangingState = false;
    this.changingStateQueue = [];
    this.currentState = undefined;
    this.states = new Map();
  }

  get currentStateName() {
    return this.currentState?.name;
  }

  update() {
    if (this.changingStateQueue.length > 0) {
      this.setState(this.changingStateQueue.shift() as string);
    }
  }

  setState(name: string) {
    const methodName = 'setState';
    if (!this.states.has(name)) {
      console.warn(
        `[${StateMachine.name}-${this.id}:${methodName}] tried to change to unknown state: ${name}`
      );
      return;
    }

    if (this.isCurrentState(name)) {
      return;
    }

    if (this.isChangingState) {
      this.changingStateQueue.push(name);
      return;
    }

    this.isChangingState = true;
    console.log(
      `[${StateMachine.name}-${this.id}:${methodName}] changed from ${
        this.currentState?.name ?? 'none'
      } to ${name}`
    );

    this.currentState = this.states.get(name);

    if (this.currentState?.onEnter) {
      this.currentState.onEnter();
      console.log(
        `[${StateMachine.name}-${this.id}:${methodName}] ${this.currentState.name} on enter invoked`
      );
    }

    this.isChangingState = false;
  }

  addState(state: State) {
    this.states.set(state.name, {
      name: state.name,
      onEnter: this.context ? state.onEnter?.bind(this.context) : state.onEnter,
    });
  }

  private isCurrentState(name: string) {
    if (!this.currentState) {
      return false;
    }

    return this.currentState.name === name;
  }
}
