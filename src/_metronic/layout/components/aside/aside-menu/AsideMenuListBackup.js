/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl, checkIsActive } from "../../../../_helpers";

export function AsideMenuList({ layoutProps }) {
    const location = useLocation();
    const getMenuItemActive = (url, hasSubmenu = false) => {
        return checkIsActive(location, url)
            ? ` ${!hasSubmenu && "menu-item-active"} menu-item-open `
            : "";
    };

    return (
        <>
            {/* begin::Menu Nav */}
            <ul className={`menu-nav ${layoutProps.ulClasses}`}>
                <li className={`menu-item ${getMenuItemActive("/dashboard", false)}`} aria-haspopup="true">
                    <NavLink className="menu-link" to="/dashboard">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Layers.svg")} />
                        </span>
                        <span className="menu-text">Dashboard</span>
                    </NavLink>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/setup", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/setup">
                        <span className="svg-icon menu-icon">
                            <SVG
                                src={toAbsoluteUrl("/media/svg/icons/Code/Settings4.svg")}
                            />
                        </span>
                        <span className="menu-text">Setup</span>
                        <i className="menu-arrow" />
                    </NavLink>
                    <div className="menu-submenu ">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className={`menu-item ${getMenuItemActive("/setup-manufacturer")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/setup-manufacturer">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Globe.svg")} />
                                    </span>
                                    <span className="menu-text">Manufacturer</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/setup-interestRate")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/setup-interestRate">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Shopping/Calculator.svg")} />
                                    </span>
                                    <span className="menu-text">Interest Rate</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/setup-make")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/setup-make">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Component.svg")} />
                                    </span>
                                    <span className="menu-text">Make</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/equipment", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/equipment">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Shopping/Box2.svg")} />
                        </span>
                        <span className="menu-text">Equipment</span>
                        <i className="menu-arrow" />
                    </NavLink>
                    <div className="menu-submenu">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className="menu-item menu-item-parent" aria-haspopup="true">
                                <span className="menu-link">
                                    <span className="menu-text">Equipment</span>
                                </span>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/equipment-create")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/equipment-create">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Send.svg")} />
                                    </span>
                                    <span className="menu-text">Create Equipment</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/equipment-emi-setup")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/equipment-emi-setup">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Shield-check.svg")} />
                                    </span>
                                    <span className="menu-text">Equipment EMI Setup</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/equipment-emi-list")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/equipment-emi-list">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">Equipment EMI List</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/equipment-rentrate-setup")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/equipment-rentrate-setup">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Clipboard-check.svg")} />
                                    </span>
                                    <span className="menu-text">Equipment Rent Rate Setup</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/equipment-list")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/equipment-list">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">Equipment List</span>
                                </NavLink>
                            </li>

                        </ul>
                    </div>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/emo", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/equipment">
                        <span className="svg-icon menu-icon">
                            <SVG
                                src={toAbsoluteUrl("/media/svg/icons/Communication/Archive.svg")}
                            />
                        </span>
                        <span className="menu-text">EMO</span>
                        <i className="menu-arrow" />
                    </NavLink>
                    <div className="menu-submenu">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className="menu-item menu-item-parent" aria-haspopup="true">
                                <span className="menu-link">
                                    <span className="menu-text">EMO</span>
                                </span>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/emo-create")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/emo-create">
                                    <span className="svg-icon menu-icon">
                                        <SVG
                                            src={toAbsoluteUrl("/media/svg/icons/Files/DownloadedFile.svg")}
                                        />
                                    </span>
                                    <span className="menu-text">Create EMO</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/emo-list")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/emo-list">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">EMO List</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/emo-receive")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/emo-receive">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Files/File-done.svg")} />
                                    </span>
                                    <span className="menu-text">Receive EMO</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/emo-rceive-list")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/emo-rceive-list">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">Receive EMO List</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/release", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/release">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Chat-check.svg")} />
                        </span>
                        <span className="menu-text">Equipment Release</span>
                        <i className="menu-arrow" />
                    </NavLink>
                    <div className="menu-submenu ">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className="menu-item  menu-item-parent" aria-haspopup="true">
                                <span className="menu-link">
                                    <span className="menu-text">Error Pages</span>
                                </span>
                            </li>

                            <li className={`menu-item ${getMenuItemActive("/release-equipment")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/release-equipment">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Sending.svg")} />
                                    </span>
                                    <span className="menu-text">Equipment Release</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/release-list-equipment")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/release-list-equipment">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">Equipment Release List</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/billingsetup", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/billingsetup">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/General/Clipboard.svg")} />
                        </span>
                        <span className="menu-text">Billing Setup</span>
                    </NavLink>
                    <div className="menu-submenu">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className="menu-item menu-item-parent" aria-haspopup="true">
                                <span className="menu-link">
                                    <span className="menu-text">Billing Setup</span>
                                </span>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/billingsetup-parameter")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/billingsetup-parameter">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Settings-3.svg")} />
                                    </span>
                                    <span className="menu-text">Billing Parameter</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/billingsetup-billingpolicy")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/billingsetup-billingpolicy">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Settings-1.svg")} />
                                    </span>
                                    <span className="menu-text">Billing Policy Setup</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/billingsetup-list-billingpolicy")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/billingsetup-list-billingpolicy">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">Billing Policy List</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/generate-bill", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/generate-bill">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Book.svg")} />
                        </span>
                        <span className="menu-text">Billing</span>
                    </NavLink>
                    <div className="menu-submenu">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className="menu-item menu-item-parent" aria-haspopup="true">
                                <span className="menu-link">
                                    <span className="menu-text">Billing</span>
                                </span>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/generate-bill-create")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/generate-bill-create">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Book-open.svg")} />
                                    </span>
                                    <span className="menu-text">Billing Generate</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/generate-bill-list")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/generate-bill-list">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")} />
                                    </span>
                                    <span className="menu-text">Bill List </span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className={`menu-item menu-item-submenu ${getMenuItemActive("/accesscontrol", true)}`} aria-haspopup="true" data-menu-toggle="hover">
                    <NavLink className="menu-link menu-toggle" to="/accesscontrol">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/General/Lock.svg")} />
                        </span>
                        <span className="menu-text">Access Control</span>
                    </NavLink>
                    <div className="menu-submenu">
                        <i className="menu-arrow" />
                        <ul className="menu-subnav">
                            <li className="menu-item menu-item-parent" aria-haspopup="true">
                                <span className="menu-link">
                                    <span className="menu-text">Access Control</span>
                                </span>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/accesscontrol-rolemanagement")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/accesscontrol-rolemanagement">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Shopping/Price1.svg")} />
                                    </span>
                                    <span className="menu-text">Role Management</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/accesscontrol-pagemanagement")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/accesscontrol-pagemanagement">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")} />
                                    </span>
                                    <span className="menu-text">Page Management</span>
                                </NavLink>
                            </li>
                            <li className={`menu-item ${getMenuItemActive("/accesscontrol-userrolepermission")}`} aria-haspopup="true">
                                <NavLink className="menu-link" to="/accesscontrol-userrolepermission">
                                    <span className="svg-icon menu-icon">
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/User.svg")} />
                                    </span>
                                    <span className="menu-text">User Role Permission</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </>
    );
}
