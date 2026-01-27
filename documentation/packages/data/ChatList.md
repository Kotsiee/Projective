# Data Component: ChatList

The `ChatList` is a specialized display component optimized for real-time messaging interfaces. It
features reverse-infinite scrolling (loading history as the user scrolls up), scroll anchoring to
maintain position during message bursts, and a seamless integration with subscription-based data
sources.

## 📂 Project Structure

```text
packages/data/
├── src/
│   ├── components/
│   │   └── displays/
│   │       └── ChatList.tsx      # Main chat orchestrator
│   ├── hooks/
│   │   ├── useScrollAnchoring.ts # Logic for sticky-to-bottom behavior
│   │   └── useVirtual.ts         # Window-scroll virtualizer integration
│   └── styles/
│       └── components/
│           └── chat-list.css     # Optional inversion or chat-specific layout
```

## 🚀 Usage

### Real-time Message Feed

Implementing a chat view with a `RealtimeDataSource` that supports metadata for total counts and a
subscription method for new messages.

```tsx
import { ChatList } from '@projective/data';

export default function ProjectChat({ messageSource }) {
	return (
		<ChatList
			dataSource={messageSource}
			estimateHeight={80}
			pageSize={30}
			renderItem={(message) => (
				<div className='chat-bubble'>
					<span className='author'>{message.sender}</span>
					<p>{message.text}</p>
				</div>
			)}
		/>
	);
}
```

## ⚙️ API Reference

### ChatList Props

Designed specifically for the messaging persona.

| Prop             | Type                    | Default | Description                                                   |
| :--------------- | :---------------------- | :------ | :------------------------------------------------------------ |
| `dataSource`     | `RealtimeDataSource<T>` | -       | A DataSource extended with `getMeta` and `subscribe` methods. |
| `renderItem`     | `(item: T) => VNode`    | -       | Function to render the individual message bubble.             |
| `estimateHeight` | `number`                | `80`    | Average height of a message for virtualization.               |
| `pageSize`       | `number`                | `20`    | Number of messages to load when fetching history.             |

## 🕹️ Logic & Real-time Features

- **Reverse-Infinite Loading**: On mount, the component fetches the _last_ page of messages. As the
  user scrolls toward the top (index < 5), it triggers `loadMore()` to prepend older messages
  without losing the current scroll position.
- **Scroll Anchoring**: The `useScrollAnchoring` hook tracks the `scrollHeight` and `scrollTop`. If
  the user is at the bottom, it "locks" them there as new messages arrive; if they are reading
  history, it adjusts the scroll position by the height of newly loaded items to prevent jumping.
- **Real-time Subscriptions**: If the `dataSource` provides a `subscribe` method, the component
  automatically listens for incoming messages, appends them to the signal, and triggers a smooth
  scroll to bottom.
- **Window Virtualization**: Unlike the general `DataDisplay`, `ChatList` is hard-coded to use
  `window` scroll mode, ensuring it feels like a native mobile or desktop chat application.

## 🎨 Styling

Styles are defined in `chat-list.css`:

- **Scroll Inversion**: Some implementations use `transform: scaleY(-1)` on the container and items
  to force the "bottom" to be the start of the list.
- **Loading Indicators**: Includes an absolute-positioned "Loading history..." spinner that appears
  at the top of the viewport when `loadMore` is active.
- **Skeleton States**: Leverages `skeleton.css` to show pulsing placeholders during the initial
  meta-fetch or history load.
