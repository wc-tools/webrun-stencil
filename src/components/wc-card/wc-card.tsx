import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'wc-card',
  styleUrl: 'wc-card.css',
  shadow: true,
})
export class WcCard {
  @Prop() heading: string;
  @Prop() subtitle: string;
  @Prop() imageUrl: string;
  @Prop() imageAlt: string = '';

  render() {
    return (
      <Host>
        <div class="card">
          {this.imageUrl && (
            <div class="card-image">
              <img src={this.imageUrl} alt={this.imageAlt} />
            </div>
          )}
          <div class="card-content">
            {this.heading && <h3 class="card-title">{this.heading}</h3>}
            {this.subtitle && <p class="card-subtitle">{this.subtitle}</p>}
            <div class="card-body">
              <slot></slot>
            </div>
          </div>
          <div class="card-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </Host>
    );
  }
}
