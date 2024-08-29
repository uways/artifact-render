import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { parse, Allow } from "partial-json";
import "./App.css";

const simulateStream = async function* (message, delay = 50) {
  for (const char of message) {
    yield char;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

const artifactCode = `
  > Compare the two panes

  This is a test message with an artifact code block.
  \`\`\`artifact
  {
    "type": "report",
    "title": "Test Report",
    "content": [
      {
        "type": "section",
        "title": "Section 1",
        "content": [
          {
            "type": "paragraph",
            "content": "This is a paragraph"
          },
          {
            "type": "graph",
            "data": [
              {
                "name": "Page A",
                "uv": 4000,
                "pv": 2400,
                "amt": 2400
              },
              {
                "name": "Page B",
                "uv": 3000,
                "pv": 1398,
                "amt": 2210
              },
              {
                "name": "Page C",
                "uv": 2000,
                "pv": 9800,
                "amt": 2290
              }
            ]
          }
        ]
      }
    ]
  }
  \`\`\`

  after which you can also add some markdown
  * list item 1
  * list item 2
  * list item 3
`;

function App() {
  const [displayedMessage, setDisplayedMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const streamMessage = async () => {
      const stream = simulateStream(artifactCode, 20);

      for await (const char of stream) {
        if (!isMounted) break;

        setDisplayedMessage((prev) => prev + char);
      }
    };

    streamMessage();
    return () => {
      isMounted = false;
    };
  }, []);

  function Artifact({ children }) {
    return <button style={{ border: "1px solid red" }}>{children}</button>;
  }

  return (
    <div className="App">
      <h3>Artifact Message Render</h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Raw</th>
            <th>Rendered</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              style={{
                textAlign: "left",
                width: "50%",
                whiteSpace: "pre-line",
              }}
            >
              {displayedMessage}
            </td>
            <td style={{ width: "50%", verticalAlign: "baseline" }}>
              <ReactMarkdown
                components={{
                  code: (props) => {
                    console.log("code props", props);
                    if (props.className === "language-artifact") {
                      let artifact = null;
                      try {
                        artifact = parse(props.children, {
                          allow: Allow.STR | Allow.OBJ | Allow.ARR,
                        });
                      } catch (error) {
                        console.error(error);
                      }

                      if (artifact === null) {
                        return (
                          <div>
                            <span class="loader">Loading...</span>
                          </div>
                        );
                      }
                      return <Artifact>Report Artifact</Artifact>;
                    }
                  },
                }}
              >
                {displayedMessage}
              </ReactMarkdown>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
