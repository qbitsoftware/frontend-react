import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
import { useMemo } from 'react';
import { YooptaContentValue } from '@yoopta/editor';
import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import Table from '@yoopta/table'
import Divider from '@yoopta/divider'
import Accordion from '@yoopta/accordion'
import Code from '@yoopta/code'
import Embed from '@yoopta/embed'
import Callout from '@yoopta/callout'
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import Image from '@yoopta/image';
import { Dispatch, SetStateAction } from 'react';
import { usePostImage } from '@/queries/images';


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
  value: YooptaContentValue | undefined
  setValue: Dispatch<SetStateAction<YooptaContentValue | undefined>> | undefined;
  readOnly: boolean
}

export default function Editor({ value, setValue, readOnly }: Props) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const postImageMutation = usePostImage()

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await postImageMutation.mutateAsync(formData);

      return {
        secure_url: result.data.url,
        width: result.data.width || 600,
        height: result.data.height || 600
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      // Fallback to local URL for testing or when upload fails
      return {
        secure_url: URL.createObjectURL(file),
        width: 600,
        height: 600
      };
    }
  }

  const plugins = useMemo(() => [
    Paragraph,
    Table,
    Divider.extend({
      elementProps: {
        divider: (props) => ({
          ...props,
          color: '#007aff',
        }),
      },
    }),
    Accordion,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    Callout,
    NumberedList,
    BulletedList,
    TodoList,
    Code,
    Embed,
    Image.extend({
      options: {
        async onUpload(file) {
          const data = await uploadFile(file);

          return {
            src: data.secure_url,
            alt: 'digitalocean',
            sizes: {
              width: data.width,
              height: data.height,
            },
          };
        },
      },
    }),
  ], [])


  if (setValue && readOnly == false) {
    const onChange = (value: YooptaContentValue) => {
      setValue(value);
    };
    return (
      <div className="w-full">
        <YooptaEditor
          placeholder='Start typing here...'
          editor={editor}
          //@ts-expect-error yoopta
          plugins={plugins}

          className='w-full border-gray-200 rounded-lg border py-2 px-12'
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
          className='w-full p-4'
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
    return null
  }

}