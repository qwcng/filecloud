import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-md border-1 ">
                <AppLogoIcon className="size-7 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm ">
                <span className="mb-0.5 truncate leading-tight font-bold font-poppins">Versec drive</span>
            </div>
        </>
    );
}
