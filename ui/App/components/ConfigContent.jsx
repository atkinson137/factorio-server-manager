import React from 'react';
import {IndexLink} from 'react-router';
import Settings from './Config/Settings.jsx';

class ConfigContent extends React.Component {
    constructor(props) {
        super(props);
        this.getConfig = this.getConfig.bind(this);
        this.getServerSettings = this.getServerSettings.bind(this);
        this.updateServerSettings = this.updateServerSettings.bind(this);
        this.handleServerSettingsChange = this.handleServerSettingsChange.bind(this);
        this.formTypeField = this.formTypeField.bind(this);
        this.capitalizeFirstLetter = this.capitalizeFirstLetter.bind(this)
        this.state = {
            config: {},
            serverSettings: {}
        }
    }

    componentDidMount() {
        this.getConfig();
        this.getServerSettings();
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    handleServerSettingsChange(name, e) {
        let fieldValue
        var change = this.state.serverSettings;

        if (e.target.value === "true" || e.target.value === "false") {
          // Ensure Boolean type is used if required
          if (e.target.id === "lan" || e.target.id === "public") {
            if (e.target.value == "true") {
              fieldValue = true
            } else {
              fieldValue = false
            }
            change["visibility"][e.target.id] = fieldValue
            this.setState({serverSettings: change});
            return;
          }
          fieldValue = Boolean(e.target.value)
        } else if (e.target.id === "admins" || e.target.id === "tags") {
          // Split settings values that are stored as arrays
          fieldValue = e.target.value.split(",")
        } else {
          fieldValue = e.target.value
        }
        console.log(name, fieldValue)
        change[name] = fieldValue;

        this.setState({serverSettings: change});
    }

    getConfig() {
        $.ajax({
            url: "/api/config",
            dataType: "json",
            success: (resp) => {
                if (resp.success === true) {
                    this.setState({config: resp.data})
                }
            },
            error: (xhr, status, err) => {
                console.log('/api/config/get', status, err.toString());
            }
        });
    }

    getServerSettings() {
        $.ajax({
            url: "/api/settings",
            dataType: "json",
            success: (resp) => {
                if (resp.success === true) {
                    this.setState({serverSettings: resp.data})
                    console.log(this.state)
                }
            },
            error: (xhr, status, err) => {
                console.log('/api/settings/get', status, err.toString());
            }
        });
    }

    updateServerSettings(e) {
        e.preventDefault();
        var serverSettingsJSON = JSON.stringify(this.state.serverSettings)
        $.ajax({
            url: "/api/settings/update",
            datatype: "json",
            type: "POST",
            data: serverSettingsJSON,
            success: (data) => {
                console.log(data);
                if (data.success === true) {
                    console.log("settings updated")
                }
            }
        })
    }

    formTypeField(key, setting) {
        if (key.startsWith("_comment_")) {
            return (
                <input
                   key={key}
                   ref={key}
                   id={key}
                   defaultValue={setting}
                   type="hidden"
                />
            )
        }

        switch(typeof setting) {
          case "number":
            return (
              <input
              key={key}
              ref={key}
              id={key}
              className="form-control"
              defaultValue={setting}
              type="number"
              onChange={this.handleServerSettingsChange.bind(this, key)}
              />
            )
          case "string":
            if (key.includes("password")) {
              return (
                <input
                key={key}
                ref={key}
                id={key}
                className="form-control"
                defaultValue={setting}
                type="password"
                onChange={this.handleServerSettingsChange.bind(this, key)}
                />
              )
            } else {
              return (
                <input
                key={key}
                ref={key}
                id={key}
                className="form-control"
                defaultValue={setting}
                type="text"
                onChange={this.handleServerSettingsChange.bind(this, key)}
                />
              )
            }
          case "boolean":
            return (
              <select key={key} ref={key} id={key} className="form-control" onChange={this.handleServerSettingsChange.bind(this, key)}>
                <option value={true}>True</option>
                <option value={false}>False</option>
              </select>
            )
          case "object":
            if (Array.isArray(setting)) {
              return (
                <input
                key={key}
                ref={key}
                id={key}
                className="form-control"
                defaultValue={setting}
                type="text"
                onChange={this.handleServerSettingsChange.bind(this, key)}
                />
              )
            } else {
              if (key.includes("visibility")) {
                let vis_fields = []
                for (const key in setting) {
                  const field =
                    <div>
                      <p>{key}</p>
                      <select label={key} key={key} ref={key} id={key} className="form-control" onChange={this.handleServerSettingsChange.bind(this, key)}>
                        <option selected={setting[key] ? "selected" : ""} value={true}>True</option>
                        <option selected={!setting[key] ? "selected" : ""} value={false}>False</option>
                      </select>
                    </div>
                  vis_fields.push(field)
                }

                return vis_fields
              }
            }
          default:
            return (
                <input
                    key={key}
                    ref={key}
                    id={key}
                    className="form-control"
                    defaultValue={setting}
                    type="text"
                    onChange={this.handleServerSettingsChange.bind(this, key)}
                />
            )
        }
    }


    render() {
        return(
            <div className="content-wrapper">
                <section className="content-header">
                <h1>
                    Config
                    <small>Manage game configuration</small>
                </h1>
                <ol className="breadcrumb">
                    <li><IndexLink to="/"><i className="fa fa-dashboard"></i>Server Control</IndexLink></li>
                    <li className="active">Here</li>
                </ol>
                </section>

                <section className="content">
                    <div className="box">
                        <div className="box-header">
                            <h3 className="box-title">Server Settings</h3>
                        </div>

                        <div className="box-body">
                        <div className="row">
                            <div className="col-md-10">
                                <div className="server-settings-section">
                                    <div className="table-responsive">
                                        <form ref="settingsForm" className="form-horizontal" onSubmit={this.updateServerSettings}>
                                            {Object.keys(this.state.serverSettings).map(function(key) {
                                                if (key.startsWith("_comment_"))
                                                    return(<div>{this.formTypeField(key, setting)}</div>);
                                                var setting = this.state.serverSettings[key]
                                                var setting_key = this.capitalizeFirstLetter(key.replace(/_/g, " "))
                                                var comment = this.state.serverSettings["_comment_" + key]
                                                return(
                                                  <div className="form-group">
                                                      <label htmlFor={key} className="control-label col-md-3">{setting_key}</label>
                                                      <div className="col-md-6">
                                                          {this.formTypeField(key, setting)}
                                                          <p className="help-block">{comment}</p>
                                                      </div>
                                                  </div>
                                                )
                                            }, this)}
                                            <div className="col-xs-6">
                                                <div className="form-group">
                                                    <input className="form-control btn btn-success" type="submit" ref="button" value="Update Settings" />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>

                <section className="content">
                    <div className="box">
                        <div className="box-header">
                            <h3 className="box-title">Game Configuration</h3>
                        </div>

                        <div className="box-body">
                        <div className="row">
                            <div className="col-md-10">
                            {Object.keys(this.state.config).map(function(key) {
                				var conf = this.state.config[key]
                                return(
                                    <div className="settings-section" key={key}>
                                    <h3>{key}</h3>
                                        <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Setting name</th>
                                                    <th>Setting value</th>
                                                </tr>
                                            </thead>
                                                <Settings
                                                    section={key}
                                                    config={conf}
                                                />
                                        </table>
                                        </div>
                                    </div>
                                )
                            }, this)}
                            </div>
                        </div>
                        </div>
                    </div>
                </section>


            </div>
        )
    }
}

export default ConfigContent
