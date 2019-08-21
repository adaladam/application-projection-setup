import * as React from "react";
import { render } from "react-dom";
import { Form, Field, FormRenderProps } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import ReactTags from "react-tag-autocomplete";
import cc from "copy-to-clipboard";

import "./styles.css";

type Presentation =
  | "INBOX"
  | "OUTBOX"
  | "FOR_INFORMATION"
  | "REVIEWED"
  | "ON_REVISION"
  | "IN_PROCESS"
  | "COMPLETED";

type Organization = "INITIATOR" | "SERVICE_CLIENT" | "SERVICE_OWNER" | "REGULATOR" | "OPERATOR";

type Action =
  | "ACT_ACCEPT_APPLICATION"
  | "ACT_DECLINE_APPLICATION"
  | "ACT_REJECT_APPLICATION"
  | "ACT_TAKE_NOTE"
  | "ACT_GENERATE_TESTING_ACT"
  | "ACT_SERVICE_PUBLICATION"
  | "ACT_SIGNATURE_TESTING_ACT"
  | "ACT_SIGNATURE_NEW_VERSION_DRAFT"
  | "ACT_SIGNATURE_APPLICATION_AND_AGREEMENT";

interface DynamicContainer {
  readonly name: string;
  readonly view: string;
  readonly container: string;
}

const presentations: ReadonlyArray<Presentation> = [
  "INBOX",
  "OUTBOX",
  "FOR_INFORMATION",
  "REVIEWED",
  "ON_REVISION",
  "IN_PROCESS",
  "COMPLETED"
];

const organizations: ReadonlyArray<Organization> = [
  "INITIATOR",
  "SERVICE_CLIENT",
  "SERVICE_OWNER",
  "REGULATOR",
  "OPERATOR"
];

const authorities: ReadonlyArray<string> = [
  "ROLE_USER",
  "ROLE_MODERATOR",
  "ROLE_MANAGER",
  "ROLE_ADMIN"
];

const actions: ReadonlyArray<Action> = [
  "ACT_ACCEPT_APPLICATION",
  "ACT_DECLINE_APPLICATION",
  'ACT_REJECT_APPLICATION',
  "ACT_TAKE_NOTE",
  "ACT_GENERATE_TESTING_ACT",
  "ACT_SERVICE_PUBLICATION",
  "ACT_SIGNATURE_TESTING_ACT",
  "ACT_SIGNATURE_NEW_VERSION_DRAFT",
  "ACT_SIGNATURE_APPLICATION_AND_AGREEMENT"
];

interface ApplicationProjection {
  readonly presentation: Presentation | "";
  readonly organization: Organization | "";
  readonly authorities: ReadonlyArray<string>;
  readonly actions: ReadonlyArray<Action>;
  readonly createExecutionLog: boolean;
  readonly dynamics: {
    readonly actionHandlers: ReadonlyArray<string>;
    readonly containers: ReadonlyArray<DynamicContainer>;
  };
}

const defaultDynamicContainer: DynamicContainer = {
  name: "",
  view: "",
  container: ""
};

const defaultValues: ApplicationProjection = {
  presentation: "",
  organization: "",
  authorities: [],
  actions: [],
  createExecutionLog: false,
  dynamics: {
    actionHandlers: [],
    containers: [defaultDynamicContainer]
  }
};

function App() {
  const [initialValues, setInitialValues] = React.useState<
    ApplicationProjection
  >(defaultValues);
  const onTextAreaChange = React.useCallback(
    (
      event: React.ChangeEvent<HTMLTextAreaElement>,
      form: FormRenderProps<ApplicationProjection>
    ) => {
      try {
        const value = JSON.parse(event.target.value);
        event.target.value = "";
        setInitialValues(value);
      } catch (err) {
        event.target.value = err.message;
      }
    },
    []
  );

  return (
    <div className="App">
      <h1>Application Projection Setup</h1>
      <Form
        initialValues={initialValues}
        mutators={{ ...arrayMutators }}
        onSubmit={values => console.log(values)}
        render={renderProps => (
          <form onSubmit={renderProps.handleSubmit}>
            <div>
              <div className="field">
                <label htmlFor="presentation">Presentation: </label>
                <Field name="presentation" component="select">
                  <option value="">NONE</option>
                  {presentations.map((presentation, index) => (
                    <option key={index} value={presentation}>
                      {presentation}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="field">
                <label htmlFor="organization">Organization: </label>
                <Field name="organization" component="select">
                  <option value="">NONE</option>
                  {organizations.map((organization, index) => (
                    <option key={index} value={organization}>
                      {organization}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="field">
                <label htmlFor="authorities">Authorities: </label>
                <Field
                  name="authorities"
                  type="select"
                  component="select"
                  style={{ height: "100px" }}
                  multiple
                >
                  {authorities.map((authority, index) => (
                    <option key={index} value={authority}>
                      {authority}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="field">
                <label htmlFor="actions">Actions: </label>
                <Field
                  name="actions"
                  type="select"
                  component="select"
                  style={{ height: "150px" }}
                  multiple
                >
                  {actions.map((action, index) => (
                    <option key={index} value={action}>
                      {action}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="field">
                <label htmlFor="createExecutionLog">
                  Create execution log:{" "}
                </label>
                <Field
                  name="createExecutionLog"
                  type="checkbox"
                  component="input"
                />
              </div>

              <div className="field">
                <label>Action handlers: </label>
                <Field
                  name="dynamics.actionHandlers"
                  render={field => (
                    <ReactTags
                      allowNew
                      placeholder=""
                      autofocus={false}
                      classNames={{ root: "action-handlers" } as any}
                      tags={field.input.value.map((v: string) => ({
                        name: v
                      }))}
                      handleAddition={tag =>
                        field.input.onChange([
                          ...field.input.value,
                          tag.name.trim()
                        ])
                      }
                      handleDelete={i => {
                        const newArray = [...field.input.value];
                        newArray.splice(i, 1);
                        field.input.onChange(newArray);
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <FieldArray name="dynamics.containers">
                {({ fields }) =>
                  fields.map((name, index) => (
                    <div className="dynamic" key={index}>
                      <h4>Dynamic #{index + 1}</h4>
                      <div className="field">
                        <label>Name: </label>
                        <Field
                          name={`${name}.name`}
                          component="input"
                          type="text"
                        />
                      </div>
                      <div className="field">
                        <label>View: </label>
                        <Field
                          name={`${name}.view`}
                          component="input"
                          type="text"
                        />
                      </div>
                      <div className="field">
                        <label>Container: </label>
                        <Field
                          name={`${name}.container`}
                          component="input"
                          type="text"
                        />
                      </div>
                    </div>
                  ))
                }
              </FieldArray>
            </div>

            <div className="buttons">
              <button
                type="button"
                onClick={() =>
                  renderProps.form.mutators.push(
                    "dynamics.containers",
                    defaultDynamicContainer
                  )
                }
              >
                Add dynamic
              </button>
              {renderProps.values.dynamics.containers.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    renderProps.form.mutators.pop("dynamics.containers")
                  }
                >
                  Delete last dynamic
                </button>
              )}
            </div>

            <div className="footer">
              <div className="result">
                <h4>Result</h4>
                <pre>{JSON.stringify(renderProps.values, null, 2)}</pre>
                <button
                  type="button"
                  onClick={() =>
                    cc(JSON.stringify(renderProps.values, null, 2))
                  }
                >
                  Copy
                </button>
              </div>
              <div className="initial">
                <h4>Initial value</h4>
                <textarea
                  onChange={event => onTextAreaChange(event, renderProps)}
                />
              </div>
            </div>
          </form>
        )}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
