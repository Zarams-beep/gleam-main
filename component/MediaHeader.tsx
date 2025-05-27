"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Drawer,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { CiMenuBurger } from "react-icons/ci";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { FaXmark } from "react-icons/fa6";
import "@/styles/Header.css";

export default function MediaHeaderSection() {
  const [isSticky, setSticky] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { text: "HOME", href: "/" },
    { text: "ABOUT", href: "/about-us" },
    { text: "BLOG", href: "/blog" },
    { text: "CONTACT", href: "/contact-us" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = 100;
      setSticky(Math.max(1 - scrollTop / maxScroll, 0.6));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="header-section" style={{ opacity: isSticky }}>
        <div className="header-section-div">
          {/* Logo */}
          <div className="left-side">
            <PiSmileyMeltingFill className="logo-icon" />
            <h3>GLEAM</h3>
          </div>

          {/* Mobile Menu Button */}
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
            <CiMenuBurger className="burger-menu" />
          </IconButton>
        </div>
      </header>

      {/* MUI Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "100%",
            bgcolor:"#1A1023",
            color: "#D6CFE6",
          },
        }}
      >
        <Box
          role="presentation"
          sx={{ p: 3, height: "100vh", overflowY: "auto", position: "relative" }}
        >
          {/* Close Icon */}
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#D6CFE6",
              zIndex: 10,
            }}
            aria-label="close"
          >
            <FaXmark />
          </IconButton>

          {/* Navigation Links */}
          <List sx={{ mt: 4 }}>
            {navLinks.map((link, index) => (
              <ListItem
                key={index}
               component="button"
                onClick={() => {
                  setDrawerOpen(false);
                  router.push(link.href);
                }}
              >
                <ListItemText
                  primary={link.text}
                  primaryTypographyProps={{
                    fontWeight: pathname === link.href ? "bold" : "normal",
                    color: pathname === link.href ? "#ff7e5f" : "white",
                    fontSize: "1.2rem",
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Auth & CTA Actions */}
          <Box className="drawer-btn">
            <button
              className="login-btn"
              onClick={() => {
                setDrawerOpen(false);
                router.push("/auth/log-in");
              }}
            >
              Log In
            </button>
            <button
              className="signup-btn"
              onClick={() => {
                setDrawerOpen(false);
                router.push("/auth/sign-up");
              }}
            >
              Sign Up
            </button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
