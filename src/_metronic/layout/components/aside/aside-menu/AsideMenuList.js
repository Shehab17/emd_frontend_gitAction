import React, { Component } from 'react';
import { withRouter} from "react-router";
import { NavLink } from "react-router-dom";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl, checkIsActive } from "../../../../_helpers";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

class AsideMenuList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pageList: [],
		}
	}

	componentDidMount() {
		const { loading, ...baseState } = this.state;
		this.baseState = baseState;
		this.getUserPages();
	}

	getUserPages() {

		this.setState({ loading: true });
		const jwt = JSON.parse(localStorage.getItem('MyToken'))
		const requestOptions = {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt.token },

		};
		fetch(process.env.REACT_APP_API_URL + "get_user_pages", requestOptions)
			.then((resp) => {
				return resp.json()
			})
			.then((resp) => {
				this.setState({ loading: false });
				const menu = resp.data.map(function (row) {
					return { ...row, totalSubMenu: row.subMenu.length }
				});
				this.setState({ pageList: menu });
			})
			.catch((error) => {
				console.log(error, "catch the hoop")
			});

	}

	render() {
		const { location } = this.props;
		const getMenuItemActive = (url, hasSubmenu = false) => {
			return checkIsActive(location, url)
				? ` ${!hasSubmenu && "menu-item-active"} menu-item-open `
				: "";
		};
		return (
			<>
				{/* begin::Menu Nav */}
				{this.state.loading && 
				<>
					 <ul className={`menu-nav ${this.props.layoutProps.ulClasses}`}>
						<Skeleton variant="rectangular" height={30} ></Skeleton>
						<li style={{"marginLeft":"40px"}}>
							<Skeleton count={10} ></Skeleton>
						</li>
					</ul>
					<ul className={`menu-nav ${this.props.layoutProps.ulClasses}`}>
						<Skeleton variant="rectangular" height={30} ></Skeleton>
						<li style={{"marginLeft":"40px"}}>
							<Skeleton count={6} ></Skeleton>
						</li>
					</ul>
					<ul className={`menu-nav ${this.props.layoutProps.ulClasses}`}>
						<Skeleton variant="rectangular" height={30} ></Skeleton>
						<li style={{"marginLeft":"40px"}}>
							<Skeleton count={8} ></Skeleton>
						</li>
					</ul>
				</>
				}
				<ul className={`menu-nav ${this.props.layoutProps.ulClasses}`}>
					{
						this.state.pageList.map((value, index) =>
							<li className={`menu-item menu-item-submenu ${getMenuItemActive(`/${value.pagesLink}`, true)}`} aria-haspopup="true" data-menu-toggle="hover" key={index}>
								<NavLink className="menu-link menu-toggle" to={`/${value.pagesLink}`}>
									<span className="svg-icon menu-icon">
										<SVG src={toAbsoluteUrl(value.iconPath)} />
									</span>
									<span className="menu-text">{value.pagesTitle}</span>
									{value.totalSubMenu !== 0 && <i className="menu-arrow" />}
								</NavLink>
								{value.totalSubMenu !== 0 &&
									value.subMenu.map((item, key) =>
										<div className="menu-submenu" key={key}>
											<i className="menu-arrow" />
											<ul className="menu-subnav">
												<li className="menu-item menu-item-parent" aria-haspopup="true">
													<span className="menu-link">
														<span className="menu-text">{value.pagesTitle}</span>
													</span>
												</li>
												<li className={`menu-item ${getMenuItemActive(`/${item.pagesLink}`)}`} aria-haspopup="true">
													<NavLink className="menu-link" to={`/${item.pagesLink}`}>
														<span className="svg-icon menu-icon">
															<SVG src={toAbsoluteUrl(item.iconPath)} />
														</span>
														<span className="menu-text">{item.pagesTitle}</span>
													</NavLink>
												</li>
											</ul>
										</div>

									)}
							</li>
						)
					}

				</ul>
				{/*  <pre>
					 	{JSON.stringify(this.state, null, 2)}
				 </pre> */}
			</>
		);
	}
}

export default withRouter(AsideMenuList);
