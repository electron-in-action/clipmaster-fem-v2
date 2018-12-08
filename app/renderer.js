import React from 'react';
import { render } from 'react-dom';

import { v4 as uuid } from 'uuid';

import { clipboard, ipcRenderer } from 'electron';

const writeToClipboard = content => {
  clipboard.writeText(content);
  new Notification('Clipping Copied', {
    body: `${clipboard.readText()}`,
  });
};

class Application extends React.Component {
  state = { clippings: [] };

  componentDidMount() {
    ipcRenderer.on('write-to-clipboard', this.handleWriteToClipboard);
    ipcRenderer.on('create-new-clipping', this.createNewClipping);
  }

  componentWillUnmount() {
    ipcRenderer.off('write-to-clipboard', this.handleWriteToClipboard);
    ipcRenderer.off('create-new-clipping', this.createNewClipping);
  }

  createNewClipping = () => {
    const { clippings } = this.state;

    const content = clipboard.readText();
    const id = uuid();

    const clipping = { id, content };

    this.setState({ clippings: [clipping, ...clippings] });
  };

  handleWriteToClipboard = () => {
    const clipping = this.state.clippings[0];
    if (clipping) writeToClipboard(clipping.content);
  };

  render() {
    return (
      <div className="container">
        <header className="controls">
          <button id="copy-from-clipboard" onClick={this.createNewClipping}>
            Copy from Clipboard
          </button>
        </header>

        <section className="content">
          <div className="clippings-list">
            {this.state.clippings.map(clipping => (
              <Clipping {...clipping} key={clipping.id} />
            ))}
          </div>
        </section>
      </div>
    );
  }
}

const Clipping = ({ content }) => {
  const copy = () => writeToClipboard(content);

  return (
    <article className="clippings-list-item">
      <div className="clipping-text" disabled={true}>
        {content}
      </div>
      <div className="clipping-controls">
        <button onClick={copy}>&rarr; Clipboard</button>
      </div>
    </article>
  );
};

render(<Application />, document.getElementById('application'));
