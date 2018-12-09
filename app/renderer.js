import React from 'react';
import { render } from 'react-dom';

import { clipboard, ipcRenderer } from 'electron';

import database from './database';

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

    this.fetchClippings();
  }

  componentWillUnmount() {
    ipcRenderer.off('write-to-clipboard', this.handleWriteToClipboard);
    ipcRenderer.off('create-new-clipping', this.createNewClipping);
  }

  fetchClippings = () => {
    database('clippings')
      .select()
      .then(clippings => this.setState({ clippings }));
  };

  createNewClipping = () => {
    const content = clipboard.readText();

    database('clippings')
      .insert({ content })
      .then(this.fetchClippings);
  };

  removeClipping = id => {
    database('clippings')
      .where('id', id)
      .delete()
      .then(this.fetchClippings);
  };

  updateClipping = id => {
    database('clippings')
      .where('id', id)
      .update({
        content: clipboard.readText(),
      })
      .then(this.fetchClippings);
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
              <Clipping
                {...clipping}
                key={clipping.id}
                onRemove={this.removeClipping}
                onUpdate={this.updateClipping}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }
}

const Clipping = ({ id, content, onRemove, onUpdate }) => {
  const copy = () => writeToClipboard(content);
  const remove = () => onRemove(id);
  const update = () => onUpdate(id);

  return (
    <article className="clippings-list-item">
      <div className="clipping-text" disabled>
        {content}
      </div>
      <div className="clipping-controls">
        <button onClick={copy}>&rarr; Clipboard</button>
        <button onClick={update}>Update</button>
        <button className="remove-clipping" onClick={remove}>
          Remove
        </button>
      </div>
    </article>
  );
};

render(<Application />, document.getElementById('application'));
