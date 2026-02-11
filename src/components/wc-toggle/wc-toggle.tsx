import { Component, Host, h, Prop, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
  tag: 'wc-toggle',
  styleUrl: 'wc-toggle.css',
  shadow: true,
})
export class WcToggle {
  @Prop() label: string;
  @Prop({ mutable: true }) checked: boolean = false;
  @Prop() disabled: boolean = false;

  @State() internalChecked: boolean = false;

  @Event() wcToggle: EventEmitter<boolean>;

  @Watch('checked')
  checkedChanged(newValue: boolean) {
    this.internalChecked = newValue;
  }

  componentWillLoad() {
    this.internalChecked = this.checked;
  }

  private handleToggle = () => {
    if (!this.disabled) {
      this.internalChecked = !this.internalChecked;
      this.checked = this.internalChecked;
      this.wcToggle.emit(this.internalChecked);
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleToggle();
    }
  };

  render() {
    return (
      <Host>
        <div class="toggle-wrapper">
          <button
            type="button"
            role="switch"
            aria-checked={this.internalChecked ? 'true' : 'false'}
            class={`toggle ${this.internalChecked ? 'toggle--checked' : ''}`}
            disabled={this.disabled}
            onClick={this.handleToggle}
            onKeyDown={this.handleKeyDown}
          >
            <span class="toggle-thumb"></span>
          </button>
          {this.label && <span class="toggle-label">{this.label}</span>}
        </div>
      </Host>
    );
  }
}
