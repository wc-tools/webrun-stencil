import { Component, Host, h, Prop, Event, EventEmitter, State, Listen } from '@stencil/core';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  tag: 'wc-dropdown',
  styleUrl: 'wc-dropdown.css',
  shadow: true,
})
export class WcDropdown {
  @Prop() label: string;
  @Prop() options: DropdownOption[] = [];
  @Prop({ mutable: true }) value: string = '';
  @Prop() placeholder: string = 'Select an option';
  @Prop() disabled: boolean = false;

  @State() isOpen: boolean = false;
  @State() selectedOption: DropdownOption | null = null;

  @Event() wcSelect: EventEmitter<string>;

  private dropdownRef?: HTMLDivElement;

  componentWillLoad() {
    if (this.value) {
      this.selectedOption = this.options.find(opt => opt.value === this.value) || null;
    }
  }

  @Listen('click', { target: 'window' })
  handleClickOutside(event: MouseEvent) {
    if (this.dropdownRef && !this.dropdownRef.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  private toggleDropdown = () => {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  };

  private selectOption = (option: DropdownOption) => {
    if (!option.disabled) {
      this.selectedOption = option;
      this.value = option.value;
      this.isOpen = false;
      this.wcSelect.emit(option.value);
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.isOpen = false;
    }
  };

  render() {
    return (
      <Host>
        <div class="dropdown-wrapper" ref={el => (this.dropdownRef = el)}>
          {this.label && <label class="dropdown-label">{this.label}</label>}
          <button
            type="button"
            class={`dropdown-trigger ${this.isOpen ? 'dropdown-trigger--open' : ''}`}
            disabled={this.disabled}
            onClick={this.toggleDropdown}
            onKeyDown={this.handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={this.isOpen ? 'true' : 'false'}
          >
            <span class="dropdown-value">
              {this.selectedOption ? this.selectedOption.label : this.placeholder}
            </span>
            <span class="dropdown-arrow">▼</span>
          </button>
          {this.isOpen && (
            <ul class="dropdown-menu" role="listbox">
              {this.options.map(option => (
                <li
                  key={option.value}
                  class={`dropdown-option ${option.disabled ? 'dropdown-option--disabled' : ''} ${
                    this.selectedOption?.value === option.value ? 'dropdown-option--selected' : ''
                  }`}
                  role="option"
                  aria-selected={this.selectedOption?.value === option.value ? 'true' : 'false'}
                  aria-disabled={option.disabled ? 'true' : 'false'}
                  onClick={() => this.selectOption(option)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Host>
    );
  }
}
