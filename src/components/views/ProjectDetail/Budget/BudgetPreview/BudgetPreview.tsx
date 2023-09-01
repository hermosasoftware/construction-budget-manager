import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Divider,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, Gear } from 'phosphor-react';
import { useAppSelector } from '../../../../../redux/hooks';
import BudgetReport, {
  IExportSettings,
} from '../../../../reports/BudgetReport/BudgetReport';
import { getProjectById } from '../../../../../services/ProjectService';
import { getProjectBudget } from '../../../../../services/ProjectBudgetService';
import { getBudgetActivity } from '../../../../../services/BudgetActivityService';
import { getBudgetSubcontracts } from '../../../../../services/BudgetSubcontractsService';
import { getBudgetLabors } from '../../../../../services/BudgetLaborsService';
import { getBudgetMaterials } from '../../../../../services/BudgetMaterialsService';
import { getBudgetOthers } from '../../../../../services/BudgetOthersService';
import { IProject } from '../../../../../types/project';
import { IProjectBudget } from '../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import { IBudgetSubcontract } from '../../../../../types/budgetSubcontract';
import { IBudgetLabor } from '../../../../../types/budgetLabor';
import { IMaterialBreakdown } from '../../../../../types/collections';
import { IBudgetOther } from '../../../../../types/budgetOther';
import DownloadPDF from '../../../../common/PDF/DownloadPDF';
import Form, { Switch } from '../../../../common/Form';

import styles from './BudgetPreview.module.css';

const initialExportSettings = {
  showActivities: true,
  showLabors: true,
  showSubcontracts: true,
  showOthers: true,
  detailedActivities: false,
  detailedMaterials: false,
};

export default function ActivityPreview() {
  const projectId = useParams().projectId as string;
  const navigate = useNavigate();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [project, setProject] = useState<IProject>();
  const [budget, setBudget] = useState<IProjectBudget>();
  const [activity, setActivity] = useState<IBudgetActivity[]>([]);
  const [exportSettings, setExportSettings] = useState<IExportSettings>(
    initialExportSettings,
  );
  const [noteValue, setNoteValue] = useState('');

  const appStrings = useAppSelector(state => state.settings.appStrings);

  const getProject = async () => {
    const successCallback = (response: IProject) => setProject(response);
    await getProjectById({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getBudget = async () => {
    const successCallback = async (response: IProjectBudget) => {
      const labors = await getLabors();
      const subcontracts = await getSubcontracts();
      const others = await getOthers();
      setBudget({ ...response, labors, subcontracts, others });
    };
    await getProjectBudget({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getActivity = async () => {
    const successCallback = (response: IBudgetActivity[]) => {
      const list = response.map(async element => {
        const materials = await getMaterials(element.id);
        return { ...element, materials };
      });
      Promise.all(list).then(a => setActivity(a));
    };
    await getBudgetActivity({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getMaterials = async (activityId: string) => {
    let list: IMaterialBreakdown[] = [];
    const successCallback = (response: IMaterialBreakdown[]) => {
      list = response;
    };

    await getBudgetMaterials({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const getLabors = async () => {
    let list: IBudgetLabor[] = [];
    const successCallback = (response: IBudgetLabor[]) => (list = response);
    await getBudgetLabors({
      projectId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const getSubcontracts = async () => {
    let list: IBudgetSubcontract[] = [];
    const successCallback = (response: IBudgetSubcontract[]) =>
      (list = response);
    await getBudgetSubcontracts({
      projectId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const getOthers = async () => {
    let list: IBudgetOther[] = [];
    const successCallback = (response: IBudgetOther[]) => (list = response);
    await getBudgetOthers({
      projectId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const handleOnSettingsSubmit = (data: IExportSettings) => {
    setExportSettings(data);
    onClose();
  };

  useEffect(() => {
    let abortController = new AbortController();
    getProject();
    getBudget();
    getActivity();

    return () => abortController.abort();
  }, []);

  const PDFToolbar = () => (
    <div className={styles.toolbar_container}>
      <Button
        className={styles.toolbar_button}
        onClick={() => navigate(-1)}
        variant="unstyled"
        title={appStrings?.back}
      >
        <ArrowLeft size={22} />
      </Button>
      <div>
        <DownloadPDF fileName={`Budget-${project?.name}`}>
          <BudgetReport
            project={project!}
            budget={budget!}
            activity={activity}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            exportSettings={exportSettings}
            pdfMode={true}
          />
        </DownloadPDF>
        <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
          <PopoverTrigger>
            <Button
              className={styles.toolbar_button}
              variant="unstyled"
              title={appStrings?.exportSettings}
            >
              <Gear size={22} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="bold" fontSize="md">
              {appStrings?.exportSettings}
            </PopoverHeader>
            <PopoverBody p={4}>
              <Form
                id="settings-form"
                initialFormData={exportSettings}
                validateOnChange
                validateOnBlur
                onSubmit={handleOnSettingsSubmit}
              >
                <Stack spacing={2}>
                  <Switch
                    name="showActivities"
                    labelPlacement="inline"
                    label={appStrings?.showActivities}
                  />
                  <Switch
                    name="detailedActivities"
                    labelPlacement="inline"
                    label={`- ${appStrings?.detailedActivities}`}
                    containerClassName={styles.pl}
                  />
                  <Switch
                    name="detailedMaterials"
                    labelPlacement="inline"
                    label={`- ${appStrings?.detailedMaterials}`}
                    containerClassName={styles.pl}
                  />
                  <Switch
                    name="showLabors"
                    labelPlacement="inline"
                    label={appStrings?.showLabors}
                  />
                  <Switch
                    name="showSubcontracts"
                    labelPlacement="inline"
                    label={appStrings?.showSubcontracts}
                  />
                  <Switch
                    name="showOthers"
                    labelPlacement="inline"
                    label={appStrings?.showOthers}
                  />
                  <Divider />
                  <ButtonGroup
                    size="sm"
                    display="flex"
                    justifyContent="flex-end"
                  >
                    <Button variant="ghost" onClick={onClose}>
                      {appStrings?.cancel}
                    </Button>
                    <Button type="submit">{appStrings?.apply}</Button>
                  </ButtonGroup>
                </Stack>
              </Form>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <>
      {project && budget && activity.length ? (
        <div className={`${styles.page_container}`}>
          <PDFToolbar />
          <BudgetReport
            project={project}
            budget={budget}
            activity={activity}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            exportSettings={exportSettings}
            pdfMode={false}
          />
        </div>
      ) : (
        <Skeleton className={styles.page_container} height={'95%'} />
      )}
    </>
  );
}
