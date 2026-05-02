import { Box } from "lucide-react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

export default function Navbar() {
  const { isSignedIn, username, signIn, signOut } =
    useOutletContext<AuthContext>();


  const handleAuthClick = async () => {
    console.log("AUTH BUTTON CLICKED", { isSignedIn, signIn, signOut });

    if (isSignedIn) {
      try {
        await signOut();
        console.log("SIGNED OUT");
      } catch (e) {
        console.error(`Puter sign out failed: ${e}`);
      }

      return;
    }

    try {
      console.log("SIGNING IN...");
      await signIn();
      console.log("SIGN IN COMPLETE");
    } catch (e) {
      console.error(`Puter sign in failed: ${e}`);
    }
  };

  return (
    <nav>
      <header className="navbar">
        <nav className="inner">
          <div className="left">
            <div className="brand">
              <Box className="logo" />
              <span className="name">Roomify</span>
            </div>

            <ul className="links">
              <li>
                <a href="#">Product</a>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
              <li>
                <a href="#">Community</a>
              </li>
              <li>
                <a href="#">Enterprise</a>
              </li>
            </ul>
          </div>

          <div className="actions">
            {isSignedIn ? (
              <>
                <span className="greeting">
                  {username ? `Hi, ${username}` : "Signed in"}
                </span>

                <Button
                  size="sm"
                  onClick={handleAuthClick}
                  className="btn"
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAuthClick}
                  size="sm"
                  variant="ghost"
                  className="login"
                >
                  Log In
                </Button>

                <a href="#upload" className="cta">
                  Get Started
                </a>
              </>
            )}
          </div>
        </nav>
      </header>
    </nav>
  );
}