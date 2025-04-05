function LoadingLink({ to, onClick, children, ...props }) {
    const handleClick = (e) => {
        console.log("LoadingLink clicked, navigating to:", to);
        e.preventDefault(); // Prevent the default navigation
        if (onClick) onClick();
        setTimeout(() => {
            window.location.href = to;
        }, 2000);
    };
    return (
        <a href={to} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}
export default LoadingLink;

