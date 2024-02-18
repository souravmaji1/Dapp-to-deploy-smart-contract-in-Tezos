import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  Select,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  AppShell,
  Sidebar,
  SidebarSection,
  NavItem,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavGroup,
  SearchInput,
} from '@saas-ui/react'
import { FiHome, FiUsers, FiSettings,FiHelpCircle } from 'react-icons/fi'
import {
  Badge,
  Text,
} from '@chakra-ui/react'

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import Tree from 'react-d3-tree';
import { IoMdAddCircleOutline } from "react-icons/io";

export default function Page() {
    const router = useRouter();
    const isNavItemActive = (href) => router.pathname === href;
 
    const [tezos, setTezos] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);



  const [contract, setContract] = useState(null);
  const [contractFunctions, setContractFunctions] = useState([]);
  const [contractAddressInput, setContractAddressInput] = useState('');




  useEffect(() => {
    const initializeTezos = () => {
      const tezosInstance = new TezosToolkit('https://ghostnet.ecadinfra.com');
      setTezos(tezosInstance);
    };
    

    initializeTezos();
  }, []);

  const handleConnectWallet = async () => {
    const options = {
      name: 'MyAwesomeDapp',
      iconUrl: 'https://tezostaquito.io/img/favicon.svg',
      network: { type: 'ghostnet' },
      eventHandlers: {
        PERMISSION_REQUEST_SUCCESS: {
          handler: async (data) => {
            console.log('permission data:', data);
          },
        },
      },
    };
    const wallet = new BeaconWallet(options);

    try {
      
      await wallet.requestPermissions();

      tezos.setWalletProvider(wallet);

      // Retrieve the public key hash (PKH) using the tezos instance
      const pkh = await tezos.wallet.pkh();
      setConnectedWallet(pkh);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const loadContractFunctions = async (contractAddress) => {
    try {
      // Create a Contract instance using the tezos instance and the contract address
      const contractInstance = await tezos.contract.at(contractAddress);
      setContract(contractInstance);
  
      // Retrieve the contract schema, which contains entrypoints (functions)
    //  const contractSchema = await contractInstance.schema;
      const entrypoints = contractInstance.entrypoints.entrypoints;

      console.log(entrypoints);
      setContractFunctions(entrypoints);
      
    } catch (error) {
      console.error('Error loading contract functions:', error);
    }
  };
  


  const handleLoadContractFunctions = async () => {
    await loadContractFunctions(contractAddressInput);
  };

  const transformContractFunctionsToTreeData = (contractFunctions) => {
    const rootNode = {
      name: 'Contract Functions',
      attributes: {},
      children: [],
    };
  
    Object.keys(contractFunctions).forEach((funcName) => {
      const funcNode = {
        name: funcName,
        attributes: {},
        children: [],
      };
  
      // Add more details as needed
  
      rootNode.children.push(funcNode);
    });
  
    return rootNode;
  };

  const Mindmap = ({ contractFunctions }) => {
    const treeData = transformContractFunctionsToTreeData(contractFunctions);
    const treeStyles = {
      links: {
        stroke: '#555', // Change link color
      },
      nodes: {
        node: {
          circle: {
            fill: '#fff', // Change node background color to white
            stroke: '#555', // Change node border color
          },
          name: {
            fill: '#000', // Change node text color
          },
        },
      },
    };
    
    return (
      <Tree
        data={treeData}
        orientation="vertical"
        translate={{ x: 300, y: 50 }}
        pathFunc="diagonal"
        allowForeignObjects
        nodeSize={{ x: 200, y: 100 }}
      />
    );
  };

// Function to load contract functions based on the provided contract addres

  return (
    <AppShell
      variant="static"
      height="100vh"
      navbar={
        <Navbar borderBottomWidth="1px" position="sticky" top="0">
          <NavbarBrand>
           
          </NavbarBrand>
          <NavbarContent justifyContent="flex-end">
            <NavbarItem>
              <SearchInput size="sm" />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      }
      sidebar={
        <Sidebar position="sticky" top="56px" toggleBreakpoint="sm">
          <SidebarSection>
         
          <NavGroup>
              <NavItem href='/' icon={<FiHome />} 
              isActive={isNavItemActive('/')}
              >
                Home
              </NavItem>
              
              <NavItem href='/testcontract' icon={<IoMdAddCircleOutline />}
              isActive={isNavItemActive('/testcontract')}
              >Generate Mindmap</NavItem>
              
            </NavGroup>

            

           
          </SidebarSection>
          <SidebarSection flex="1" overflowY="auto"></SidebarSection>
          <SidebarSection>
            <NavItem icon={<FiHelpCircle />}>Documentation</NavItem>
         
          </SidebarSection>
        </Sidebar>
      }
    >
      <Box as="main" flex="1" py="2" px="4" overflowY="scroll">
      
      <VStack spacing={8} align="center" p={8} boxShadow="lg" borderWidth="1px" borderRadius="md">
      <Heading size="lg">Generate Mindmap for Your Tezos Smart Contract</Heading>

      {tezos && !connectedWallet && (
        <Button colorScheme="teal" size="md" onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      )}

{connectedWallet && (
  <Box>
    {/* ... (previous code) */}
    <FormControl>
            <FormLabel>Enter Contract Address:</FormLabel>
            <Input
              value={contractAddressInput}
              onChange={(e) => setContractAddressInput(e.target.value)}
              placeholder="Contract Address"
            />
          </FormControl>

          <br></br>

          <Button colorScheme="teal" size="md" onClick={handleLoadContractFunctions}>
            Load Contract Functions
          </Button>
          {contract && (
  <Box mt={4}>
    <Heading size="md">Contract Functions:</Heading>
   
    <VStack width="600px"  borderWidth="1px" borderRadius="10px" padding='10px' background="white" align="start" mt={2}>
      
       <Mindmap contractFunctions={contractFunctions} />
    </VStack>
  </Box>
)}

   
  </Box>
)}


    </VStack>


      </Box>
    </AppShell>
  )
}