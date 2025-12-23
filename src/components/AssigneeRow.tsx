import { useState, useRef, useEffect } from 'react';
import { User, X, Settings } from 'lucide-react';
import { PlusIcon, AgentIcon } from '@primer/octicons-react';
import { ActionList, Avatar, IconButton } from '@primer/react';
import { SidebarRow } from './SidebarRow';
import { db } from '../lib/db';
import styles from './IssueSidebar.module.css';

interface AssigneeRowProps {
  issueId: string;
}

// Sample list of available assignees
const AVAILABLE_ASSIGNEES = [
  { username: 'johndoe', avatar: 'https://github.com/johndoe.png' },
  { username: 'janedoe', avatar: 'https://github.com/janedoe.png' },
  { username: 'alice', avatar: 'https://github.com/alice.png' },
  { username: 'bob', avatar: 'https://github.com/bob.png' },
  { username: 'charlie', avatar: 'https://github.com/charlie.png' },
  { username: 'peterloveland', avatar: 'https://github.com/peterloveland.png' },
  { username: 'laurmo', avatar: 'https://github.com/laurmo.png' },
  { username: 'labudis', avatar: 'https://github.com/labudis.png' },
];

const AGENTS = [
  {
    name: "copilot",
    avatar:
      "https://external-preview.redd.it/github-copilot-with-microsoft-visual-studio-v0-6tu2QwvAliANk-cC4Is_8PFPrwxeHeFj_e-fBW9JbCo.jpg?auto=webp&s=e97e278492dd12ee674e710b4931580f4fb66351",
  },
  {
    name: "claude",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtUnGYPe67wuzVDjTujZ21UV38Y6KQ290fow&s",
  },
  {
    name: "codex",
    avatar:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxQSEhUSEBIVFRAVGBgYFxgXGBcaGRkXGRkYGhoaFxkbHSggGhonHxcXITEhJikrLi4vGh8zODMtNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABwgEBQYBAwL/xABHEAABAwICBgUGCwcDBQEAAAABAAIDBBEFBgcSITFBYRMiUXGBYnKRobGyCBQyNUJSc4KDs8EjJDM0Q3SSU6LRFyXC4fBj/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJxREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERc5nXOdNhkXSVDrvdfUjbbXeeQ4DtKDoyVzmMZ7w+lJbPVxB43tadd3i1tyFXPOOkqtxAlrpDDT8IoyQLeW7e/x2cly9Bhs051YIZJT2MY53psNiCyj9NGFA2Esh5iJ/wCoWxw3Sjhc5s2rYw//AKB0frcAFXdmjrEyLigmt3Aeom61WKZeqqb+Yppoh2uY4D02sguVTzte0OY4OadxaQQe4hfVU3y5miqoH69JO9na292O85h2Hd3qf9HGlaHENWCpAhrOAv1JLfUJ3O8k+F0EkotNiea6KnNp6uCM9he2/ovdaxuknCybfHof93tsg6xFrsNx2mqBenqIpfMe0+oFbFAREQEREBERAREQEREBERAREQEREBERBpc35jjw+lkqZtzRZreL3n5LR3n0C6qbmDG56+odPO4vlkNgBcgDc1jBwHCy77T9mQz1raRjv2VMOsO2VwufQLDxK2OgHJolc7EZ23bGdSAHcX/Sf4bhzJ7EGfo80MN1W1GKAlxsW04NgOI6UjaT5I8VMuH0EUDBHDGyNg3NY0NHoCyAvUBfiWNrgQ8BzTvBFx4grns3Z3pMObeolHSWu2JtjI77vAczsUA530r1dfeOImnpTs1GHrOHlv3+AsO9BtNMlHhEbv3E2rb9dkNjCBx1uDXcm+IUWNJG0bLbuS2eAYBUVsgipIXSP42HVaO17tzR3qcsk6FIIQJMRPTy7+jFxE08+L/HZyQV/p6WSQ/s2PefJaXH1LKkwOqaLupZwO0xPH6K5VHQxwtDYY2RtG4NaGj1L72QUhY5zHXaS17TvFwQfaCpCyfperaMtZO41NPxEh/aAeTJvPc6/grA49lKjrGltTTRv8q2q8dz22IUGaRdEUlE11RRF01MNrmkXkjHbs+U0dtrhBOeU81U2Iwialff6zDsew9jh+u4reKm2VcyT4fUNqKZ1iNjmn5L28WuHZ7FbHKmYYq+mZUwHqu2Fp3sePlNdzH/AAg3CIiAiIgIiICIiAiIgIiICItfjmMRUkD6ioeGRMFyfYAOJJ2WQZlRO1jS97g1jRcucQAB2kncovzRpupICWUjHVMg+kDqR384i7vAeKiTSDpCnxOQtJMdID1Igdmzc6T6zvUOC02AZUqq0PdTQudGwFz3nqsaACT1jsJ2bhtQYOM4g6pnlnk+XK9zzy1je3huVtsgYYKbDqWEDaImF3NzhrOPpJVPVdjC/wCDF9mz3Qg/ddWMhjfLK4MjYC5zjuDRvJUEZ402ySa0WGNMce7pnDrnzG7m95ue5SRpndbB6q3ZGPTKxViwHDvjNTBT62r00jI79gc4An1oPm3pamX6cs8h5ve53tJUtZI0IvktLibjGzeIWHrnz3bm9wueYUtZTyXSYczVpohrkWdI7bI7vdwHIbF0SDBwfB4aWMRU0TYox9Fot4niTzKz1qcw5jpqGPpauVsbeAPynHsa3e4qCs8aaJ6jWioAaeHdr/1XDlwYO655oJizTpAocPdqVE37X/TYNd45uA+T4rYZbzTS17Nekma+29u57fOadoVPI4nyu6rXSSOuTYFzid5PaV9KCulppBJC98UrTsc0lrhyP/BQXYXjm32HcoRyPpvB1YcUbY7AJ2DZ+Izh3j0KZ6CujnY2SGRskbhdrmkEEd4QVw02ZKbQ1IqIG2pagk2G6OTe5o5HaR4r76AszGCtNI8/sancOyVo2Ed4BHgFMWlbBxVYXUstd7GdKzt1o+ts7wCPFVWwqtME0Uzb60T2PH3XA/oguui/EEms0OG4gH0i6/aAiIgIiICIiAiIgIiIPCVWnTdnE1lWaWJ37tTOI2HY+Xc53htaPHtU8Z8xn4nQVFQPlsjOp57uq31kKolHA+aVkbdskjw0c3ONhfxKDuNFOj12Jy9LPdtFGeudxkdv1GnhzP8A8LF1lDHBRSxQsbHEyGQNa0WAGoV7lbA2UVLDTRjqxtAJ+s7e5x5kklZGO/y0/wBlJ7hQUrV2cM/gxeYz3QqTK7OGfwYvMZ7oQchpp+Z6r8P81irpkH5zov7iL3wrF6afmeq/D/NYqyYFiJpqmGoDQ4wyNkDTsBLTex9CC5tVUsiYZJXtYxouXOIAA5kqHs76bmR60WGN6R+4zPHUHmN3u7zYd6ifN2davEX3qZT0d+rE3ZG3ubxPM3KysnaPqzEiDFHqQcZpAQz7vF57kHP4vi01VIZamV8sp+k438ANwHILtdHui2bEmid8jYqS/wAoEOe628NaN3e63csbOei6tw+79Xp6f/UjBNvPZvb37RzXO5czLU0EnSUkzozxG9juTmnYfagtXlXJ9Jh7NWlhDXEdaQ7ZHd7jttyGxarOmjWjxEFzmdFUcJYwASfLG5/jt5rQZH0y01VqxVoFNObDW/pOPnfQPfs5qUmPBAIIIO4jce5BU7Oejusw4l0jOkp+E0dy37w3sPfs5rXZVzdVYc/XpZS1t+tGdsb/ADm7vEbVcJ8YIIcAWnYQdoI5hRZnfQxT1OtLQkU85uSz+k4929nhs5IGA6W6Svp5Yaj93qXRSDVcbxvOqfkP/Q28VXJbfMeWqmhk6KrhdG7gd7Hc2OGwrWUwbrt6Q2ZrDWPY2+0+i6C6OB3+Lw339FHfv1Qs1YeEVkU0LJIHh8LmjUcNxFlmICIiAiIgIiICIiAiIgjL4QdTq4WGj+pPGD3AOd7QFDWiKmEmL0gIuA9zv8GOcPWApo+EDSl+Faw/pzRuPcdZvtcFCeiqsEOLUj3GzekLf82uYPW4ILbLBx3+Wn+yk9wrNCwsd/lp/spPcKClauzhn8GLzGe6FSZXCyXmOnraaN1NK1xaxoe2/WY4AXDm7wg0+mn5nqvw/wA1iq/htC+omjgiAMkr2sbc2Gs42Fz2bVaDTT8zVX4f5rFXTIPzlRf3EXvhBNuSdDFPTWlriKmcbdS1omnu3vPfs5KU4ow0BrQA0bAALADkF+0QeEKOs76I6St1pIB8WqTt1mDqOPls/UWUjIgpjmXA5KGpkpZ9XpIyLlpuCCA4EeBC32S9JFZhxDWP6Wn4wyEltvIO9h7tnJffTX88VP4f5bV+8raNJsQoDV0sjTM2RzDE7YHABpBa/gdp2H0oJ2yXpFo8RAbG/o6jjC8gO+6dzx3LsFSmvoJqWUxzMfFMw7nAtcDwIP6hSTkfTNUU2rFXg1EG7X/qsHfueOR280FgMXwqGpidFURtkjcLFrhfxHYeYVZ9KOjx+GSiSLWfRSHqOO9jvqP/AEPFWcw6tZPEyaJwdFI0OaRxaRcLFzLgkdbTS00wuyRpF/qu+i4cwbHwQV+0J54NHUCknd+6TmwvujlO4jsadx8CrKKlGKUL6eaSCQWkie5ju9pts9qtboyx41uHQTON5A3o5PPZ1SfGwPig6pERAREQEREBERAREQafN+Diso56Y75Y3BvJ29p9ICp4A+KTiyWN3i17T7QQrtqvOnfJRgmOIQN/YTH9tb6Ep+kewO9vegmfI+YmYhRQ1LT1nNtIPqyN2OHpFxyIW8ljDmlrhdrgQR2g7CqraMM9uwufr3dSSkdKwbx2Pb5Q9Y8FZ/B8VhqomzU8jZInC4c0+ojeDyKCv2e9DtTTF81COnprk6g/isHZb6YHaNvJRvh2ITUsokgkfFM072ktItwP/BV1lxedNGtHiILnM6Ko4SxgAnzxuf47eaCH8X0sPrcNmoqyL9u8M1ZWWDXar2uOu3gbDePQFyGQfnKi/uIvfC2GdNHdZhpJkZ0lPwmj2t+8N7D37Oa53B8QdTzxVDAC6J7ZADuJaQbHlsQXVRR5knS1R12rHKfi9Sdmo89Rx8h+7wNipCBQeoi4vOmkqjw4Fr39LUcIo7E/fduYO/byQQVpr+eKn8P8tiln4PPzY/7d/usUC5uzA6vq5Kp7Ax0hHVbcgBoDRtO/YFPXwefmx/27/dYg7bMuV6avj6Oria8fRdue3m128KomNUghqJoQbiKWSME7yGOLQT6FdVUzzd/P1f8AcT/mOQWe0TH/ALRR/Zn33LrlyOiX5oo/sz77l1yCsGnigEWLPc0W6WOOQ9+1p9xd58G2sJpqqIn5ErXD77bH3FxvwhJw7FGtG9kEbT3lz3exwXV/BqgPRVj+BfG3xAcf/IIJqREQEREBERAREQEREBY9dRsmjdFKwPjeC1zXC4IPArIRBTPNdHFDW1MNPfoY5XsZrG5s1xFr8dx2r9ZbzPVUEnSUkzmH6Td7Hec07D7VjY869VOTvMsnvuUx0GiSnr8LpZ4HdDVuha5ztrmPJ+uOB5j0FBvcj6ZaaqtFW2pp92sT+yceTj8g8j6VKLHggEEEHaCNxHJU7zPlSqw+TUq4i2/yXjax/mu3Hu3ra5L0j1mHENY/pafjDISRbyDvYe7ZyQWukjDgQ4AtOwgi4I5hRZnfQvT1OtLQkU852lm+Jx7t7D3bOS6XJekejxEBrH9FUcYZCA6/kHc8d3oXS4nicVPGZaiRscbd7nEAf+zyQU/zFlypoZOiq4XRu4E7Wu5tduIXT5K0q1lAQx7vjFNs6kh6zR5D947jcLo9JmluOrjfSUkDXwuuDLM25742/RPlH0KIYoy4hrQXOJsABck9gA3oJKzrpiqqu8dLelpzsOqbyuFuL/ojzfSuDwnCp6yXoqeJ8srjezQSdvFx4DmVJWR9Cs8+rLiDjBDv6MfxXDnwYPSVOmAZfp6KMRUsTY2cbb3Htc7eSgqLmTA5KGodTT6vSsDS7VNwC5oda/Hep++Dz82P+3f7rFE2mv54qfw/y2KWfg8/Nj/t3+6xBKCpnm7+eq/7if8AMcrmKmebv56r/uJ/zHILPaJfmij+zPvuXU1M7Y2Oe8hrGgucTuAAuSfALldEx/7PR/Zn33KNdNOklsodh9E68e6eVp2Ot/TYeI7T4dqCMM542a2tnqttpHktB4MHVYOWwBWJ0IYMabC43OFnzkzHzXbGf7QD4qA9HeVXYlWMhAPQts+Z3BsYO0X7TuH/AKVt4Igxoa0ANaAABuAGwAIPoiIgIiICIiAiIgIiIC8K9RBTzPuHmDEauI8Jnkea867fU4KwOgvFhPhUbL3fA58Tu65c3/a4ehcJ8IjLZZNHXxt6kgEcpHB7fkE97dn3Qua0OZxGH1erM61LUWa88GOv1X922x5HkgsziFDHOx0U8bZInCzmuAIPgVDOd9CG+XC3W4mB52fhv4dx9Km1jgRcG4PFfpBSivoZqaUxzMfFMw7nAtcCDsI/5C+mJ4zPU6vxmeSXVFm67i6w5XVucy5Vpa9mpVwtf9V257fNeNoXM5e0Q4fSydLqOneNrRMQ5re5oABPM3QQrknRjWYhZ+r0FMd8sgO0eQ3e71Dmp+ybo+o8NF4Y9ee22Z9i893Bo5BdW1ttnAL8yytaC5xDWjaSTYAcyg/awcXxeGljMtTK2OMcXG3gOJPIKM876aoKfWiw8ComGzpD/CaeXF57tnNQZmDMFTWydLVzOkdwBPVaOxrRsaO5BsNIuOx12IT1MOt0Ty0N1hYkNa1tyOF7XU2/B5+bH/bv91ii7JGiirr9WSUfF6Y/TeOu4eQzf4mw71YvK+X4qCnZTU4Ijbc3O0ucd7nHtKDbKmmbT+/Vf9xP+Y5XGq5xGxz3GzWNLieQFyqWYhUGaaSS22WRzrc3uJ/VBvanPlY6jioGydHTRt1bMuHPFyeu69yNu4bFgZYy1UV8whpWaztms4/JYPrPPAKV8raCb6smITjVIB6KG/oc9w9g8VMWBYHBRxCKlibHGODRtJ7XHe48yg1mRMoQ4ZTiGLrPdYyyEbXv7eTRwHBdIiICIiAiIgIiICIiAiIgIiINbmHBYq2nkpp23jkFj2g7w4cwbHwVTc45Xmw6pdTzt2bTG/6MjL7HDn2jgVcRaXNeV6fEYTDVMuN7XDY9jvrMPA+ooIK0baW5KICmrdaWlFgxw2yR8tvymct49SnrAsxU1YwPpZ45B2NPWHnNO0HvCrnnTRPWURL4mmppuD4xdzR5bBt8Rcdy4OGZ8brsc5jxxaS1w8RtQXdXhKp/TZ5xGMWZXVFh2vJ9t1i4jmisnFp6ud7ewyOt6L2QWRznpSoqAFgeJ6j/AE4iDY+W/c3u38lAectIFZiTiJpNSDhDHcMHncXnvXJ3Xe6KcPwuaYjFJS14I6ON5DYX+c/tvwNh3oNLlLJdXiLtWmiPRg9aV3Vjb97ieQuVPmR9E1JQ6sko+MVI+m8dRp8hm7xNyu8oqdkbGtha1sYA1QwANA5W2L7oPAF6vCbbVHOfdLFNRNdFTObUVe4Bpuxh7ZHDs+qNvcgw9O2b201KaON37xUizgN7YvpE9mtuHioh0U5dNbiMLbXiiPSyHhqs2geLtUelaCtrKivqS+QumqZnAbN5cdga0cBwAVmdFWSxhlLaQA1UtnSns7GA9jfWboO3CIiAiIgIiICIiAiIgIiICIiAiIgIiIPCFpcYyjRVW2ppYpHfWLQHf5Dat2iDgJtDmFON/i7xyEsgHtWdh+jDC4SC2jY4jjIXP9TiQuxRBGukTRPBXN6WlDIKtosLC0bwNweBuPlD1qvuYMuVNDJ0dXC6N3AkdV3NrhsKuYseuoY5mGOaNkkZ3te0OB8CgqDgub62kGrTVUsbfq612/4uuFv/APq/i1rfGR39FHf3VNGKaH8MmJcIXRE/6Ty0f4m7fUtR/wBB6C/8aot2azPbqoIRxjOVdVjVqauV7DvbrarT3tbYFfLLmV6qvk6Okhc/btduY3m524e1WMwrRDhcBBMBlcP9VxcP8djfUu2pKRkTAyJjWMG5rQGgdwGxBwujfRlDho6WUiatI2vt1Y+1sY/8t55KQLJZeoCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIg//Z",
  },
];

export function AssigneeRow({ issueId }: AssigneeRowProps) {
  const [clickedAssignee, setClickedAssignee] = useState<string | null>(null);
  const [localAssignees, setLocalAssignees] = useState<string[]>([]);
  const [hoverCardPosition, setHoverCardPosition] = useState({ top: 0, left: 0 });
  const chipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const prevAssigneesRef = useRef<string[]>([]);
  const newAssigneeIndicesRef = useRef<Map<string, number>>(new Map());
  const issue = db.getById(issueId);

  useEffect(() => {
    if (clickedAssignee && chipRefs.current[clickedAssignee]) {
      const rect = chipRefs.current[clickedAssignee]!.getBoundingClientRect();
      setHoverCardPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [clickedAssignee]);

  if (!issue) {
    return null;
  }

  // Combine assignees and agents for editing
  const assigneesValue = [...(issue.assignees || []), ...(issue.agents || [])];

  const handleCreateCustomSession = () => {
    alert('Create a new custom agent session');
  };

  const handleEditingChange = (isEditing: boolean) => {
    if (isEditing) {
      // When opening, set local state to current value
      setLocalAssignees(assigneesValue);
    } else {
      // When closing, save to database if changed
      if (JSON.stringify(localAssignees) !== JSON.stringify(assigneesValue)) {
        // Separate assignees and agents
        const humanAssignees = localAssignees.filter(a => !AGENTS.some(agent => agent.name === a));
        const agentAssignees = localAssignees.filter(a => AGENTS.some(agent => agent.name === a));
        db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  const toggleAssignee = (assignee: string) => {
    const isAgent = AGENTS.some(agent => agent.name === assignee);
    let newAssignees = localAssignees.includes(assignee)
      ? localAssignees.filter(a => a !== assignee)
      : [...localAssignees, assignee];
    
    // If assigning an agent and peterloveland isn't assigned, add them
    if (isAgent && !localAssignees.includes(assignee) && !newAssignees.includes('peterloveland')) {
      newAssignees = [...newAssignees, 'peterloveland'];
    }
    
    setLocalAssignees(newAssignees);
  };

  const removeAssignee = (assignee: string) => {
    // Directly update the database
    const currentAssignees = [...(issue.assignees || []), ...(issue.agents || [])];
    const newAssignees = currentAssignees.filter(a => a !== assignee);
    
    // Separate assignees and agents
    const humanAssignees = newAssignees.filter(a => !AGENTS.some(agent => agent.name === a));
    const agentAssignees = newAssignees.filter(a => AGENTS.some(agent => agent.name === a));
    
    db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
    window.dispatchEvent(new Event('storage'));
    setClickedAssignee(null);
  };

  const isAssigned = (assignee: string) => {
    return localAssignees.includes(assignee);
  };

  // Render display function
  const renderDisplay = (assignees: string[]) => {
    // Only show human assignees in the display (agents shown separately)
    const humanOnly = assigneesValue.filter(a => !AGENTS.some(agent => agent.name === a));
    const hasAgents = assigneesValue.some(a => AGENTS.some(agent => agent.name === a));
    
    if (assigneesValue.length === 0) {
      return null;
    }

    // If we have agents but no human assignees
    if (hasAgents && humanOnly.length === 0) {
      return (
        <span className={styles.emptyState}>
          No user is assigned
        </span>
      );
    }

    // Find newly added assignees and assign them indices
    const newAssignees = humanOnly.filter(assignee => !prevAssigneesRef.current.includes(assignee));
    
    // Assign indices to new assignees
    newAssignees.forEach((assignee, index) => {
      if (!newAssigneeIndicesRef.current.has(assignee)) {
        newAssigneeIndicesRef.current.set(assignee, index);
      }
    });
    
    // Clean up indices for removed assignees
    prevAssigneesRef.current.forEach(assignee => {
      if (!humanOnly.includes(assignee)) {
        newAssigneeIndicesRef.current.delete(assignee);
      }
    });
    
    prevAssigneesRef.current = humanOnly;

    return (
      <div className={styles.multipleListContainer}>
        {humanOnly.map((assignee) => {
          const userInfo = AVAILABLE_ASSIGNEES.find(
            (u) => u.username === assignee
          );
          const newAssigneeIndex = newAssigneeIndicesRef.current.get(assignee);
          const hasDelay = newAssigneeIndex !== undefined;
          
          return (
            <div
              key={assignee}
              ref={(el) => (chipRefs.current[assignee] = el)}
              className={styles.assigneeChip}
              onClick={(e) => {
                e.stopPropagation();
                setClickedAssignee(
                  clickedAssignee === assignee ? null : assignee
                );
              }}
              style={{ 
                cursor: "pointer", 
                position: "relative",
                transitionDelay: hasDelay ? `${newAssigneeIndex * 0.05}s` : '0s'
              }}
            >
              <div className={styles.assigneeChipInner}>
                {userInfo ? (
                  <Avatar
                    src={userInfo.avatar}
                    alt={assignee}
                    className={styles.assigneeAvatar}
                    size={16}
                  />
                ) : (
                  <div className={styles.assigneeAvatar}>
                    <User className={styles.assigneeAvatarIcon} />
                  </div>
                )}
                <span className={styles.assigneeName}>{assignee}</span>
              </div>

              {clickedAssignee === assignee && (
                <>
                  <div
                    className={styles.hoverBackdrop}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedAssignee(null);
                    }}
                  />
                  <div
                    className={styles.hoverCard}
                    style={{
                      top: `${hoverCardPosition.top}px`,
                      left: `${hoverCardPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.hoverCardHeader}>
                      {userInfo ? (
                        <img
                          src={userInfo.avatar}
                          alt={assignee}
                          className={styles.hoverCardAvatar}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className={styles.hoverCardAvatar}>
                          <User className={styles.hoverCardAvatarIcon} />
                        </div>
                      )}
                      <div className={styles.hoverCardInfo}>
                        <div className={styles.hoverCardName}>{assignee}</div>
                        <div className={styles.hoverCardRole}>Assignee</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAssignee(assignee);
                      }}
                      className={styles.removeButton}
                    >
                      Remove assignee
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render editor function
  const renderEditor = (assignees: string[]) => {
    // Use assigneesValue (initial state) for grouping, not localAssignees
    // This prevents items from moving until the dialog closes
    const selectedAgents = AGENTS.filter(agent => assigneesValue.includes(agent.name));
    const selectedUsers = AVAILABLE_ASSIGNEES.filter(user => assigneesValue.includes(user.username));
    const unselectedAgents = AGENTS.filter(agent => !assigneesValue.includes(agent.name));
    const unselectedUsers = AVAILABLE_ASSIGNEES.filter(user => !assigneesValue.includes(user.username));
    
    return (
      <div style={{ width: "296px" }}>
        {/* Selected items at the top */}
        {(selectedUsers.length > 0 || selectedAgents.length > 0) && (
          <ActionList selectionVariant="multiple">
            {selectedUsers.map((user) => (
              <ActionList.Item
                key={user.username}
                onSelect={() => toggleAssignee(user.username)}
                role="menuitemradio"
                selected={isAssigned(user.username)}
                aria-checked={isAssigned(user.username)}
              >
                <ActionList.LeadingVisual>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                </ActionList.LeadingVisual>
                {user.username}
              </ActionList.Item>
            ))}
            {selectedAgents.map((agent) => (
              <ActionList.Item
                key={agent.name}
                role="menuitemradio"
                selected={isAssigned(agent.name)}
                aria-checked={isAssigned(agent.name)}
                onSelect={() => toggleAssignee(agent.name)}
              >
                <ActionList.LeadingVisual>
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                </ActionList.LeadingVisual>
                {agent.name}
              </ActionList.Item>
            ))}
          </ActionList>
        )}

        {/* Unselected agents */}
        <ActionList selectionVariant="multiple">
          <div className={styles.agentGroup}>
            <ActionList.GroupHeading as="h3">Agents</ActionList.GroupHeading>
            <div
              className={styles.customAgentCTA}
              onClick={handleCreateCustomSession}
              style={{ cursor: "pointer" }}
            >
              Create new
            </div>
          </div>
          {unselectedAgents.length > 0 ? (
            unselectedAgents.map((agent) => (
              <ActionList.Item
                selected={isAssigned(agent.name)}
                role="menuitemradio"
                aria-checked={isAssigned(agent.name)}
                key={agent.name}
                onSelect={() => toggleAssignee(agent.name)}
              >
                <ActionList.LeadingVisual>
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                </ActionList.LeadingVisual>
                {agent.name}
              </ActionList.Item>
            ))
          ) : (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                color: "var(--fgColor-muted, #656d76)",
                cursor: "pointer",
              }}
              onClick={handleCreateCustomSession}
            >
              All agents already assigned. Create a new custom session
            </div>
          )}

          <ActionList.GroupHeading as="h3">Users</ActionList.GroupHeading>
          {unselectedUsers.map((user) => (
            <ActionList.Item
              key={user.username}
              onSelect={() => toggleAssignee(user.username)}
              role="menuitemradio"
              selected={isAssigned(user.username)}
              aria-checked={isAssigned(user.username)}
            >
              <ActionList.LeadingVisual>
                <img
                  src={user.avatar}
                  alt={user.username}
                  style={{ width: "20px", height: "20px", borderRadius: "50%" }}
                />
              </ActionList.LeadingVisual>
              {user.username}
            </ActionList.Item>
          ))}
        </ActionList>
      </div>
    );
  };

  const humanAssignees = assigneesValue.filter(a => !AGENTS.some(agent => agent.name === a));
  const footerContent = assigneesValue.length === 0 ? (
    <div className={styles.quickActions}>
      {/* show assign copilot */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Directly update the database
          const humanAssignees = [...(issue.assignees || []), 'peterloveland'];
          const agentAssignees = [...(issue.agents || []), 'copilot'];
          db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
          window.dispatchEvent(new Event('storage'));
        }}
        className={styles.quickActionButton}
      >
        Assign Copilot
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Directly update the database
          const humanAssignees = [...(issue.assignees || []), 'peterloveland'];
          db.update(issueId, { assignees: humanAssignees });
          window.dispatchEvent(new Event('storage'));
        }}
        className={styles.quickActionButton}
      >
        Assign yourself
      </button>
    </div>
  ) : undefined;

  return (
    <SidebarRow
      label="Assignees"
      value={assigneesValue}
      type="multi-select"
      renderDisplay={renderDisplay}
      renderEditor={renderEditor}
      onChange={(newAssignees) => {
        setLocalAssignees(newAssignees);
      }}
      onEditingChange={handleEditingChange}
      footer={footerContent}
      // disableClickToEdit={true}
    />
  );
}
