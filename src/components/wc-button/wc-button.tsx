import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'wc-button',
  styleUrl: 'wc-button.css',
  shadow: true,
})
export class WcButton {
  @Prop() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Prop() disabled: boolean = false;
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';

  @Event() wcClick: EventEmitter<MouseEvent>;

  private handleClick = (event: MouseEvent) => {
    if (!this.disabled) {
      this.wcClick.emit(event);
    }
  };

  render() {
    return (
      <Host>
        <button
          type={this.type}
          class={`button button--${this.variant}`}
          disabled={this.disabled}
          onClick={this.handleClick}
        >
          <slot></slot>
        </button>
      </Host>
    );
  }
}
