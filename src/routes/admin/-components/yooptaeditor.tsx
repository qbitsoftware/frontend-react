import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
import { useMemo, useCallback } from "react";
import { YooptaContentValue } from "@yoopta/editor";
import Paragraph from "@yoopta/paragraph";
import Table from "@yoopta/table";
import Divider from "@yoopta/divider";
import Callout from "@yoopta/callout";
import File from "@yoopta/file";
import {
  Bold,
  Italic,
  CodeMark,
  Underline,
  Strike,
  Highlight,
} from "@yoopta/marks";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import { NumberedList, BulletedList } from "@yoopta/lists";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import Link from "@yoopta/link";
import ActionMenu, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import Image from "@yoopta/image";
import { Dispatch, SetStateAction } from "react";
import { usePostImage } from "@/queries/images";

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

interface Props {
  value: YooptaContentValue | undefined;
  setValue:
  | Dispatch<SetStateAction<YooptaContentValue | undefined>>
  | undefined;
  readOnly: boolean;
}

export default function Editor({ value, setValue, readOnly }: Props) {
  const editor = useMemo(() => createYooptaEditor(), []);

  const postImageMutation = usePostImage();

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("image", file);

        const result = await postImageMutation.mutateAsync(formData);

        return {
          secure_url: result.data.url,
          width: result.data.width || 600,
          height: result.data.height || 600,
        };
      } catch (error) {
        void error;
        // Fallback to local URL for testing or when upload fails
        return {
          secure_url: URL.createObjectURL(file),
          width: 600,
          height: 600,
        };
      }
    },
    [postImageMutation]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await postImageMutation.mutateAsync(formData);

        return {
          url: result.data.url,
          name: file.name,
          size: file.size,
          format: file.type,
        };
      } catch (error) {
        void error;
        return {
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          format: file.type,
        };
      }
    },
    [postImageMutation]
  );

  const plugins = useMemo(
    () => [
      Paragraph,
      Link,
      HeadingOne,
      HeadingTwo,
      HeadingThree,
      Image.extend({
        options: {
          async onUpload(file) {
            const data = await uploadImage(file);

            return {
              src: data.secure_url,
              alt: file.name,
              sizes: {
                width: data.width,
                height: data.height,
              },
            };
          },
        },
      }),
      File.extend({
        options: {
          async onUpload(file) {
            const data = await uploadFile(file);

            return {
              src: data.url,
              alt: data.name,
              name: data.name,
              size: data.size,
              format: data.format,
            };
          },
        },
      }),

      Divider.extend({
        elementProps: {
          divider: (props) => ({
            ...props,
            color: "#007aff",
          }),
        },
      }),

      Table,
      NumberedList,
      BulletedList,
      Callout,
    ],
    [uploadImage, uploadFile]
  );

  if (setValue && readOnly == false) {
    const onChange = (value: YooptaContentValue) => {
      setValue(value);
    };
    return (
      <div className="w-full">
        <YooptaEditor
          placeholder="Start typing here..."
          editor={editor}
          //@ts-expect-error yoopta
          plugins={plugins}
          className="w-full border-gray-200 rounded-lg border py-2 px-12"
          autoFocus={true}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          tools={TOOLS}
          marks={MARKS}
          width={"100%"}
        />
      </div>
    );
  } else if (readOnly) {
    return (
      <div className="w-full">
        <YooptaEditor
          editor={editor}
          //@ts-expect-error yoopta
          plugins={plugins}
          className="w-full p-4"
          autoFocus={true}
          readOnly={readOnly}
          value={value}
          tools={TOOLS}
          marks={MARKS}
          width={"100%"}
        />
      </div>
    );
  } else {
    return null;
  }
}
