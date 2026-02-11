import { Component, Host, h, Prop, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
  tag: 'wc-input',
  styleUrl: 'wc-input.css',
  shadow: true,
})
export class WcInput {
  @Prop() label: string;
  @Prop({ mutable: true }) value: string = '';
  @Prop() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Prop() placeholder: string = '';
  @Prop() required: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() error: string = '';

  @State() internalValue: string = '';

  @Event() wcInput: EventEmitter<string>;
  @Event() wcChange: EventEmitter<string>;

  @Watch('value')
  valueChanged(newValue: string) {
    this.internalValue = newValue;
  }

  componentWillLoad() {
    this.internalValue = this.value;
  }

  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.internalValue = target.value;
    this.value = target.value;
    this.wcInput.emit(target.value);
  };

  private handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.wcChange.emit(target.value);
  };

  render() {
    return (
      <Host>
        <div class="input-wrapper">
          {this.label && (
            <label class="input-label">
              {this.label}
              {this.required && <span class="required">*</span>}
            </label>
          )}
          <input
            type={this.type}
            class={`input ${this.error ? 'input--error' : ''}`}
            value={this.internalValue}
            placeholder={this.placeholder}
            required={this.required}
            disabled={this.disabled}
            onInput={this.handleInput}
            onChange={this.handleChange}
          />
          {this.error && <span class="error-message">{this.error}</span>}
        </div>
      </Host>
    );
  }
}
