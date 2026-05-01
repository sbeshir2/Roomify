import { Box } from "lucide-react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

export default function Navbar() {
  const { isSignedIn, username, signIn, signOut } =
    useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    console.log("AUTH BUTTON CLICKED", { isSignedIn });

    if (isSignedIn) {
      try {
        const ok = await signOut();
        if (ok === true) {
          console.log("SIGNED OUT");
        } else {
          console.error("Puter sign out returned false", ok);
        }
      } catch (e) {
        console.error(`Puter sign out failed: ${e}`);
      }

      return;
    }

    try {
      console.log("SIGNING IN...");
      const ok = await signIn();
      if (ok === true) {
        console.log("SIGN IN COMPLETE");
      } else {
        console.error("Puter sign in returned false", ok);
      }
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