import React, { useCallback } from "react";
import { ComponentMeta } from "@storybook/react";

import Input from "../src/Input";
import Menu from "../src/Menu";

const meta: ComponentMeta<typeof Input> = {
  title: "Input",
  component: Input,
};

export default meta;

export const Default = () => {
  const amount = 25;
  const handleChange = useCallback(() => {
    console.log("Handle");
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      <div className="fixed top-16 bg-cod-gray p-32">
        <Input
          variant="xl"
          handleChange={handleChange}
          leftElement={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-12 h-12 border border-mineshaft rounded-full"
            >
              <path
                d="M16 32c8.867 0 16-7.133 16-16S24.867 0 16 0 0 7.133 0 16s7.133 16 16 16Zm0 0"
                fill="#2775ca"
              />
              <path
                d="M20.398 18.535c0-2.336-1.398-3.137-4.199-3.469-2-.265-2.398-.8-2.398-1.734 0-.934.664-1.531 2-1.531 1.199 0 1.867.398 2.199 1.398.066.2.266.336.465.336h1.07a.457.457 0 0 0 .465-.469V13a3.33 3.33 0 0 0-3-2.734V8.668c0-.27-.2-.469-.535-.535h-1c-.266 0-.465.199-.531.535v1.531c-2 .266-3.266 1.602-3.266 3.266 0 2.203 1.332 3.07 4.133 3.402 1.867.332 2.465.735 2.465 1.801 0 1.066-.934 1.797-2.2 1.797-1.734 0-2.332-.73-2.53-1.73-.071-.27-.27-.403-.47-.403h-1.132a.46.46 0 0 0-.47.469v.066c.27 1.668 1.337 2.867 3.536 3.2v1.601c0 .266.2.465.535.531h1c.266 0 .465-.199.531-.531v-1.602c2-.332 3.332-1.734 3.332-3.53Zm0 0"
                fill="#fff"
              />
              <path
                d="M12.602 25.535c-5.204-1.867-7.868-7.668-5.934-12.8 1-2.801 3.2-4.934 5.934-5.934.265-.133.398-.336.398-.668v-.934c0-.265-.133-.465-.398-.531-.067 0-.204 0-.27.066-6.332 2-9.797 8.73-7.797 15.067a11.998 11.998 0 0 0 7.797 7.8c.27.133.535 0 .602-.269.066-.066.066-.133.066-.266v-.933c0-.2-.2-.465-.398-.598Zm7.066-20.8c-.27-.133-.535 0-.602.265-.066.066-.066.133-.066.266v.933c0 .266.2.535.398.668 5.204 1.867 7.868 7.668 5.934 12.801-1 2.797-3.2 4.934-5.934 5.934-.265.132-.398.332-.398.664v.933c0 .266.133.469.398.535.067 0 .204 0 .27-.066 6.332-2 9.797-8.734 7.797-15.066a12.088 12.088 0 0 0-7.797-7.868Zm0 0"
                fill="#fff"
              />
            </svg>
          }
          bottomElement={
            <div className="flex font-sans justify-between my-auto">
              <span className="text-stieglitz text-sm">Balance</span>
              <span className="text-white text-sm">{amount}</span>
            </div>
          }
          placeholder="0.0"
        />
      </div>
    </div>
  );
};

type ItemType = {
  textContent: string;
  icon?: boolean | JSX.Element;
  disabled?: boolean;
};

export const Variant = () => {
  const amount = 25;

  const data: ItemType[] = [
    {
      textContent: "USDC",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-12 h-12 border border-mineshaft rounded-full"
        >
          <path
            d="M16 32c8.867 0 16-7.133 16-16S24.867 0 16 0 0 7.133 0 16s7.133 16 16 16Zm0 0"
            fill="#2775ca"
          />
          <path
            d="M20.398 18.535c0-2.336-1.398-3.137-4.199-3.469-2-.265-2.398-.8-2.398-1.734 0-.934.664-1.531 2-1.531 1.199 0 1.867.398 2.199 1.398.066.2.266.336.465.336h1.07a.457.457 0 0 0 .465-.469V13a3.33 3.33 0 0 0-3-2.734V8.668c0-.27-.2-.469-.535-.535h-1c-.266 0-.465.199-.531.535v1.531c-2 .266-3.266 1.602-3.266 3.266 0 2.203 1.332 3.07 4.133 3.402 1.867.332 2.465.735 2.465 1.801 0 1.066-.934 1.797-2.2 1.797-1.734 0-2.332-.73-2.53-1.73-.071-.27-.27-.403-.47-.403h-1.132a.46.46 0 0 0-.47.469v.066c.27 1.668 1.337 2.867 3.536 3.2v1.601c0 .266.2.465.535.531h1c.266 0 .465-.199.531-.531v-1.602c2-.332 3.332-1.734 3.332-3.53Zm0 0"
            fill="#fff"
          />
          <path
            d="M12.602 25.535c-5.204-1.867-7.868-7.668-5.934-12.8 1-2.801 3.2-4.934 5.934-5.934.265-.133.398-.336.398-.668v-.934c0-.265-.133-.465-.398-.531-.067 0-.204 0-.27.066-6.332 2-9.797 8.73-7.797 15.067a11.998 11.998 0 0 0 7.797 7.8c.27.133.535 0 .602-.269.066-.066.066-.133.066-.266v-.933c0-.2-.2-.465-.398-.598Zm7.066-20.8c-.27-.133-.535 0-.602.265-.066.066-.066.133-.066.266v.933c0 .266.2.535.398.668 5.204 1.867 7.868 7.668 5.934 12.801-1 2.797-3.2 4.934-5.934 5.934-.265.132-.398.332-.398.664v.933c0 .266.133.469.398.535.067 0 .204 0 .27-.066 6.332-2 9.797-8.734 7.797-15.066a12.088 12.088 0 0 0-7.797-7.868Zm0 0"
            fill="#fff"
          />
        </svg>
      ),
      disabled: false,
    },
  ];

  const [selection, setSelection] = React.useState<any>(data[0].textContent);

  const handleSelection = (e: any) => {
    setSelection(e.target.textContent);
  };

  const handleChange = useCallback(() => {
    console.log("Handle");
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      <div className="fixed top-16 bg-cod-gray p-32 flex flex-col space-y-8">
        <Input
          variant="small"
          color="cod-gray"
          outline="umbra"
          handleChange={handleChange}
          placeholder="Small"
        />
        <Input
          variant="small"
          color="umbra"
          handleChange={handleChange}
          placeholder="Small"
        />
        <Input
          variant="medium"
          color="cod-gray"
          outline="umbra"
          handleChange={handleChange}
          placeholder="Medium"
        />
        <Input
          variant="medium"
          color="cod-gray"
          outline="umbra"
          handleChange={handleChange}
          placeholder="Medium"
        />
        <Input
          variant="medium"
          color="umbra"
          rightElement={
            <Menu
              data={data}
              selection={selection}
              dropdownVariant="icon"
              color="umbra"
              handleSelection={handleSelection}
            />
          }
          handleChange={handleChange}
          placeholder="Medium"
        />
        <Input
          variant="xl"
          color="umbra"
          outline="mineshaft"
          handleChange={handleChange}
          placeholder="XL"
        />
        <Input
          variant="xl"
          handleChange={handleChange}
          leftElement={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-12 h-12 border border-mineshaft rounded-full"
            >
              <path
                d="M16 32c8.867 0 16-7.133 16-16S24.867 0 16 0 0 7.133 0 16s7.133 16 16 16Zm0 0"
                fill="#2775ca"
              />
              <path
                d="M20.398 18.535c0-2.336-1.398-3.137-4.199-3.469-2-.265-2.398-.8-2.398-1.734 0-.934.664-1.531 2-1.531 1.199 0 1.867.398 2.199 1.398.066.2.266.336.465.336h1.07a.457.457 0 0 0 .465-.469V13a3.33 3.33 0 0 0-3-2.734V8.668c0-.27-.2-.469-.535-.535h-1c-.266 0-.465.199-.531.535v1.531c-2 .266-3.266 1.602-3.266 3.266 0 2.203 1.332 3.07 4.133 3.402 1.867.332 2.465.735 2.465 1.801 0 1.066-.934 1.797-2.2 1.797-1.734 0-2.332-.73-2.53-1.73-.071-.27-.27-.403-.47-.403h-1.132a.46.46 0 0 0-.47.469v.066c.27 1.668 1.337 2.867 3.536 3.2v1.601c0 .266.2.465.535.531h1c.266 0 .465-.199.531-.531v-1.602c2-.332 3.332-1.734 3.332-3.53Zm0 0"
                fill="#fff"
              />
              <path
                d="M12.602 25.535c-5.204-1.867-7.868-7.668-5.934-12.8 1-2.801 3.2-4.934 5.934-5.934.265-.133.398-.336.398-.668v-.934c0-.265-.133-.465-.398-.531-.067 0-.204 0-.27.066-6.332 2-9.797 8.73-7.797 15.067a11.998 11.998 0 0 0 7.797 7.8c.27.133.535 0 .602-.269.066-.066.066-.133.066-.266v-.933c0-.2-.2-.465-.398-.598Zm7.066-20.8c-.27-.133-.535 0-.602.265-.066.066-.066.133-.066.266v.933c0 .266.2.535.398.668 5.204 1.867 7.868 7.668 5.934 12.801-1 2.797-3.2 4.934-5.934 5.934-.265.132-.398.332-.398.664v.933c0 .266.133.469.398.535.067 0 .204 0 .27-.066 6.332-2 9.797-8.734 7.797-15.066a12.088 12.088 0 0 0-7.797-7.868Zm0 0"
                fill="#fff"
              />
            </svg>
          }
          bottomElement={
            <div className="flex font-sans justify-between my-auto">
              <span className="text-stieglitz text-sm">Balance</span>
              <span className="text-white text-sm">{amount}</span>
            </div>
          }
          placeholder="XL"
        />
        <Input
          variant="xl"
          handleChange={handleChange}
          leftElement={
            <div>
              <Menu
                data={data}
                selection={selection}
                dropdownVariant="icon"
                handleSelection={handleSelection}
              />
            </div>
          }
          bottomElement={
            <div className="flex font-sans justify-between my-auto">
              <span className="text-stieglitz text-sm">Balance</span>
              <span className="text-white text-sm">{amount}</span>
            </div>
          }
          placeholder="XL"
          outline="down-bad"
        />
      </div>
    </div>
  );
};

export const Outlines = () => {
  const handleChange = useCallback(() => {
    console.log("Handle");
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      <div className="fixed top-16 bg-cod-gray p-32 flex flex-col space-y-8">
        <Input
          variant="small"
          outline="mineshaft"
          handleChange={handleChange}
          placeholder="Outlined"
        />
        <Input
          variant="small"
          outline="umbra"
          color="cod-gray"
          handleChange={handleChange}
          placeholder="Outlined"
        />
        <Input
          variant="small"
          color="cod-gray"
          outline="down-bad"
          handleChange={handleChange}
          placeholder="Validation"
        />
        <Input
          variant="xl"
          color="cod-gray"
          outline="down-bad"
          handleChange={handleChange}
          placeholder="Validation"
        />
        <Input
          variant="xl"
          outline="down-bad"
          leftElement={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-12 h-12 border border-mineshaft rounded-full"
            >
              <path
                d="M16 32c8.867 0 16-7.133 16-16S24.867 0 16 0 0 7.133 0 16s7.133 16 16 16Zm0 0"
                fill="#2775ca"
              />
              <path
                d="M20.398 18.535c0-2.336-1.398-3.137-4.199-3.469-2-.265-2.398-.8-2.398-1.734 0-.934.664-1.531 2-1.531 1.199 0 1.867.398 2.199 1.398.066.2.266.336.465.336h1.07a.457.457 0 0 0 .465-.469V13a3.33 3.33 0 0 0-3-2.734V8.668c0-.27-.2-.469-.535-.535h-1c-.266 0-.465.199-.531.535v1.531c-2 .266-3.266 1.602-3.266 3.266 0 2.203 1.332 3.07 4.133 3.402 1.867.332 2.465.735 2.465 1.801 0 1.066-.934 1.797-2.2 1.797-1.734 0-2.332-.73-2.53-1.73-.071-.27-.27-.403-.47-.403h-1.132a.46.46 0 0 0-.47.469v.066c.27 1.668 1.337 2.867 3.536 3.2v1.601c0 .266.2.465.535.531h1c.266 0 .465-.199.531-.531v-1.602c2-.332 3.332-1.734 3.332-3.53Zm0 0"
                fill="#fff"
              />
              <path
                d="M12.602 25.535c-5.204-1.867-7.868-7.668-5.934-12.8 1-2.801 3.2-4.934 5.934-5.934.265-.133.398-.336.398-.668v-.934c0-.265-.133-.465-.398-.531-.067 0-.204 0-.27.066-6.332 2-9.797 8.73-7.797 15.067a11.998 11.998 0 0 0 7.797 7.8c.27.133.535 0 .602-.269.066-.066.066-.133.066-.266v-.933c0-.2-.2-.465-.398-.598Zm7.066-20.8c-.27-.133-.535 0-.602.265-.066.066-.066.133-.066.266v.933c0 .266.2.535.398.668 5.204 1.867 7.868 7.668 5.934 12.801-1 2.797-3.2 4.934-5.934 5.934-.265.132-.398.332-.398.664v.933c0 .266.133.469.398.535.067 0 .204 0 .27-.066 6.332-2 9.797-8.734 7.797-15.066a12.088 12.088 0 0 0-7.797-7.868Zm0 0"
                fill="#fff"
              />
            </svg>
          }
          handleChange={handleChange}
          placeholder="Validation"
          bottomElement={
            <div className="flex font-sans justify-between my-auto">
              <span className="text-stieglitz text-sm">Balance</span>
              <span className="text-white text-sm">{25}</span>
            </div>
          }
        />
      </div>
    </div>
  );
};
