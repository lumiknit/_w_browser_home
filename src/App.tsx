import {
  Component,
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch,
} from "solid-js";

export type Shortcut = {
  name: string;
  href: string;
  icon: string;
};

export type Data = {
  timeAlign: "left" | "center" | "right";
  shortcuts: Shortcut[];
  shortcutMargin: number;
  shortcutRows: number;
  foldedShortcuts: Shortcut[];
};

const defaultData: Data = {
  timeAlign: "center",
  shortcuts: [
    {
      name: "Google",
      href: "https://www.google.com/",
      icon: "",
    },
  ],
  shortcutMargin: 30,
  shortcutRows: 3,
  foldedShortcuts: [],
};

const shortcutsToString = (shortcuts: Shortcut[]): string =>
  shortcuts
    .map((s) => `${s.name}\n${s.href}\n${s.icon}`.trim())
    .join("\n\n")
    .trim();

const stringToShortcuts = (s: string): Shortcut[] => {
  return s
    .split("\n\n")
    .map((s) => s.trim())
    .filter((s) => s)
    .map((l) => {
      const [name, href, icon] = l.split("\n").map((s) => s.trim());
      return {
        name: name || "Link",
        href: href || "#",
        icon: icon || "",
      };
    });
};

const dataShortcutsToString = (data: Data): string => {
  const s = shortcutsToString(data.shortcuts);
  const f = shortcutsToString(data.foldedShortcuts);
  return s + "\n\n-----\n\n" + f;
};

const stringToDataShortcuts = (s: string): Partial<Data> => {
  const [shortcuts, foldedShortcuts] = s.split("-----");
  return {
    shortcuts: stringToShortcuts(shortcuts),
    foldedShortcuts: stringToShortcuts(foldedShortcuts),
  };
};

const storageName = "__home_shortcuts_data";

const loadData = (): Data => {
  // Load from local storage
  const data = localStorage.getItem(storageName);
  try {
    return { ...defaultData, ...(data ? JSON.parse(data) : {}) };
  } catch (e) {
    // Reset if error
    saveData(defaultData);
    return { ...defaultData };
  }
};

const saveData = (data: Data) => {
  localStorage.setItem(storageName, JSON.stringify(data));
};

/**
 * Return hh:mm in 24-hour format
 */
const get24HourTime = (): string => {
  const date = new Date();
  const hours = ("" + date.getHours()).padStart(2, "0");
  const minutes = ("" + date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const Shortcuts: Component<{ shortcuts: Shortcut[]; w: number }> = (props) => {
  return (
    <div class="shortcuts">
      <For each={props.shortcuts}>
        {(s) => (
          <div
            class="s-w"
            style={{
              flex: `0 0 ${props.w}%`,
            }}
          >
            <a class="f-cen shortcut" href={s.href}>
              <img
                src={
                  s.icon ||
                  "https://www.google.com/s2/favicons?sz=64&sz=32&sz=16&domain=" +
                    new URL(s.href).hostname
                }
                alt={s.name}
              />
              <div class="label">{s.name}</div>
            </a>
          </div>
        )}
      </For>
    </div>
  );
};

const App: Component = () => {
  const [data, setData] = createSignal<Data>(loadData());
  const [folding, setFolding] = createSignal<boolean>(true);
  const [editing, setEditing] = createSignal<boolean>(false);
  const [time, setTime] = createSignal<string>(get24HourTime());
  const updateData = (u: (d: Data) => Data) => {
    const newData = u(data());
    setData(newData);
    saveData(newData);
  };
  const updateTime = () => setTime(get24HourTime());

  onMount(() => {
    setTimeout(
      () => {
        updateTime();
        setInterval(updateTime, 60 * 1000);
      },
      (61 - new Date().getSeconds()) * 1000,
    );
  });

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const input = e.target as HTMLInputElement;
      let value = input.value.trim();

      // Check if it's a URL
      const re = /^([-A-Za-z]+:)?\S+\.[A-Za-z0-9]+(\/\S*)?$/;
      const result = re.exec(value);
      if (result) {
        // Check protocol exists
        if (!result[1]) {
          value = "https://" + value;
        } else if (result[1] === "http:") {
          value = "https:" + value.slice(5);
        }
        window.location.href = value;
      } else {
        const encoded = encodeURIComponent(value);
        window.location.href = `https://duckduckgo.com/?q=${encoded}`;
      }
    }
  };

  return (
    <>
      <Switch>
        <Match when={editing()}>
          <h1> Time </h1>
          <div>
            <label>
              Time alignment:
              <select
                value={data().timeAlign}
                onChange={(e) =>
                  updateData((d) => ({
                    ...d,
                    timeAlign: e.currentTarget.value as any,
                  }))
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
          </div>
          <h1> Shortcuts Config </h1>
          <div>
            <label>
              Shortcut margin:
              <input
                type="number"
                value={data().shortcutMargin}
                onChange={(e) =>
                  updateData((d) => ({
                    ...d,
                    shortcutMargin: parseInt(e.currentTarget.value),
                  }))
                }
              />
              svh
            </label>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={data().shortcutMargin}
            onChange={(e) =>
              updateData((d) => ({
                ...d,
                shortcutMargin: parseInt(e.currentTarget.value),
              }))
            }
          />
          <div>
            <label>
              Shortcut rows:
              <input
                type="number"
                value={data().shortcutRows}
                onChange={(e) =>
                  updateData((d) => ({
                    ...d,
                    shortcutRows: parseInt(e.currentTarget.value),
                  }))
                }
              />
            </label>
          </div>
          <h1> Shortcut List </h1>
          <ul>
            <li> Each item should be separated by a double newline </li>
            <li> Each item should have 3 lines: Name, URL, Icon URL </li>
          </ul>
          <textarea
            onChange={(e) =>
              updateData((d) => ({
                ...d,
                ...stringToDataShortcuts(e.currentTarget.value),
              }))
            }
            rows={15}
          >
            {dataShortcutsToString(data())}
          </textarea>
        </Match>
        <Match when>
          <div
            class="clock"
            style={{
              "text-align": data().timeAlign,
            }}
          >
            <span class="clock-text">{time()}</span>
          </div>
          <Show when={data().shortcutMargin}>
            <div
              class="m"
              style={{
                height: data().shortcutMargin + "svh",
              }}
            />
          </Show>
          <div class="f-cen search-box">
            <input
              type="search"
              class="search-form"
              placeholder="https://"
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <Shortcuts
            shortcuts={data().shortcuts}
            w={100 / data().shortcutRows}
          />
          <Show when={!folding()}>
            <Shortcuts
              shortcuts={data().foldedShortcuts}
              w={100 / data().shortcutRows}
            />
          </Show>
          <Show when={data().foldedShortcuts.length > 0}>
            <button class="btn-fold" onClick={() => setFolding((v) => !v)}>
              {folding() ? "∨" : "∧"}
            </button>
          </Show>
        </Match>
      </Switch>

      <button class="btn-edit" onClick={() => setEditing((v) => !v)}>
        {editing() ? "Done" : "Edit"}
      </button>
    </>
  );
};

export default App;
