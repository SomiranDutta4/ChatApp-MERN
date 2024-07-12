import React from 'react'
// import SearchBar from './SearchBar';
import SearchPage from '../AllChats/SearchPage';
import SearchedUsers from './SearchedUsers';

const SearchUsersPage = ({setAddingGroup,isSearch,loadAll,setsearch,setloadAll}) => {
    return (
      <div>
      <SearchPage loadAll={loadAll} isSearch={isSearch} setloadAll={setloadAll} setsearch={setsearch} />
      <SearchedUsers/>
      </div>
    );
  };
  

export default SearchUsersPage
