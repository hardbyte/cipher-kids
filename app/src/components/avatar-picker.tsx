import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

// Kid-friendly emoji categories
const EMOJI_CATEGORIES = {
  faces: {
    name: "Faces",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳"]
  },
  animals: {
    name: "Animals",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦗", "🕷", "🐢", "🐍", "🦎", "🐙", "🦑", "🦐", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🦌", "🐕", "🐩", "🐈", "🐓", "🦃", "🕊", "🐇", "🐁", "🐀", "🐿", "🦔"]
  },
  nature: {
    name: "Nature",
    emojis: ["🌱", "🌿", "🍀", "🌺", "🌸", "🌼", "🌻", "🌷", "🌹", "🌵", "🌲", "🌳", "🌴", "🌊", "⭐", "🌟", "✨", "⚡", "🔥", "❄️", "☀️", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "⛅", "⛈", "🌤", "🌦", "🌧", "⛄", "☃️", "🌈"]
  },
  food: {
    name: "Food",
    emojis: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🍍", "🥭", "🍅", "🍆", "🥑", "🥦", "🥒", "🌶", "🥕", "🌽", "🥔", "🍠", "🥐", "🍞", "🥖", "🧀", "🥯", "🥨", "🍕", "🍔", "🌭", "🥪", "🌮", "🌯", "🥙", "🍳", "🥞", "🧇", "🥓", "🍗", "🍖", "🌭", "🍟", "🍿", "🥜", "🌰", "🍯", "🥛", "🍼", "☕", "🍵", "🥤", "🧃", "🧋", "🍦", "🍧", "🍨", "🍰", "🎂", "🧁", "🍮", "🍭", "🍬", "🍫", "🍩", "🍪", "🌮", "🍺", "🍻", "🍷", "🥂", "🍾", "🍶", "🍴", "🥄", "🔪", "🍽"]
  },
  activities: {
    name: "Activities",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥅", "🏑", "🏒", "🥍", "🏏", "⛳", "🏹", "🎣", "🥊", "🥋", "🎽", "⛸", "🥌", "🛷", "🎿", "⛷", "🏂", "🏋️‍♀️", "🏋️‍♂️", "🤼‍♀️", "🤼‍♂️", "🤸‍♀️", "🤸‍♂️", "⛹️‍♀️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾‍♂️", "🏌️‍♀️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘‍♂️", "🏄‍♀️", "🏄‍♂️", "🏊‍♀️", "🏊‍♂️", "🤽‍♀️", "🤽‍♂️", "🚣‍♀️", "🚣‍♂️", "🧗‍♀️", "🧗‍♂️", "🚵‍♀️", "🚵‍♂️", "🚴‍♀️", "🚴‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪", "🤹‍♀️", "🤹‍♂️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", "🥁", "🎷", "🎺", "🎸", "🎻", "🎲", "🎯", "🎳", "🎮", "🎰"]
  },
  objects: {
    name: "Objects",
    emojis: ["🎒", "📚", "📖", "📝", "✏️", "🖍", "🖊", "🖋", "✒️", "📐", "📏", "📌", "📍", "✂️", "🔍", "🔎", "🔬", "🔭", "📡", "💡", "🔦", "🏮", "📷", "📸", "💿", "💾", "💽", "📀", "🎥", "📹", "📼", "📻", "🎙", "⏰", "⏳", "⌛", "⏱", "⏲", "🕰", "🌡", "🗺", "🧭", "🎁", "🎀", "🎊", "🎉", "🎈", "🎂", "🔮", "🛍", "📦", "💝", "💌"]
  }
};

interface AvatarPickerProps {
  selectedAvatar?: string;
  onSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarPicker({ selectedAvatar, onSelect, isOpen, onClose }: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('faces');

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Content 
        size="lg" 
        isBlurred={true}
        classNames={{
          overlay: "bg-black/80 dark:bg-black/80",
        }}
      >
        <Modal.Header>
          <Modal.Title>Choose Your Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                intent={activeCategory === key ? "primary" : "secondary"}
                size="small"
                onPress={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Current Selection Display */}
          {selectedAvatar && (
            <div className="flex items-center justify-center p-4 bg-accent/10 rounded-lg border border-accent/30">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedAvatar}</div>
                <div className="text-sm text-muted-fg">Current Avatar</div>
              </div>
            </div>
          )}

          {/* Emoji Grid */}
          <div className="max-h-80 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2 p-2">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`
                  p-3 text-2xl rounded-lg transition-colors hover:bg-accent/20 focus:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent
                  ${selectedAvatar === emoji ? 'bg-accent/30 ring-2 ring-accent' : 'bg-muted/10'}
                `}
                  title={`Select ${emoji} as avatar`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          intent="secondary"
          onPress={() => {
            onSelect(''); // Clear avatar
            onClose();
          }}
        >
          Remove Avatar
        </Button>
        <Button
          intent="secondary"
          onPress={onClose}
        >
          Cancel
        </Button>
      </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}