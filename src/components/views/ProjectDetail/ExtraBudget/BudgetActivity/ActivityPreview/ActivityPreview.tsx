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
import { useAppSelector } from '../../../../../../redux/hooks';
import ExtraReport, {
  IExportSettingsExtra,
} from '../../../../../reports/ExtraReport/ExtraReport';
import { getProjectById } from '../../../../../../services/ProjectService';
import { getExtraBudgetActivityById } from '../../../../../../services/ExtraBudgetActivityService';
import { getExtraBudgetSubcontracts } from '../../../../../../services/ExtraBudgetSubcontractsService';
import { getExtraBudgetLabors } from '../../../../../../services/ExtraBudgetLaborsService';
import { getExtraBudgetMaterials } from '../../../../../../services/ExtraBudgetMaterialsService';
import { getExtraBudgetOthers } from '../../../../../../services/ExtraBudgetOthersService';
import { IProject } from '../../../../../../types/project';
import { IBudgetActivity } from '../../../../../../types/budgetActivity';
import { IBudgetSubcontract } from '../../../../../../types/budgetSubcontract';
import { IBudgetLabor } from '../../../../../../types/budgetLabor';
import { IMaterialBreakdown } from '../../../../../../types/collections';
import { IBudgetOther } from '../../../../../../types/budgetOther';
import DownloadPDF from '../../../../../common/PDF/DownloadPDF';
import Form, { Input } from '../../../../../common/Form';

import styles from './ActivityPreview.module.css';

const initialExportSettings = {
  saleTax: 0,
};

export default function ActivityPreview() {
  const projectId = useParams().projectId as string;
  const activityId = useParams().activityId as string;
  const navigate = useNavigate();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [project, setProject] = useState<IProject>();
  const [activity, setActivity] = useState<IBudgetActivity>();
  const [materials, setMaterials] = useState<IMaterialBreakdown[]>([]);
  const [labors, setLabors] = useState<IBudgetLabor[]>([]);
  const [subcontracts, setSubcontracts] = useState<IBudgetSubcontract[]>([]);
  const [others, setOthers] = useState<IBudgetOther[]>([]);
  const [noteValue, setNoteValue] = useState('');
  const [exportSettings, setExportSettings] = useState<IExportSettingsExtra>(
    initialExportSettings,
  );

  const appStrings = useAppSelector(state => state.settings.appStrings);

  const getProject = async () => {
    const successCallback = (response: IProject) => setProject(response);
    await getProjectById({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getActivity = async () => {
    const successCallback = (response: IBudgetActivity) =>
      setActivity(response);
    await getExtraBudgetActivityById({
      projectId,
      extraBudgetActivityId: activityId,
      appStrings,
      successCallback,
    });
  };

  const getMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setMaterials(response);
    await getExtraBudgetMaterials({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const getLabors = async () => {
    const successCallback = (response: IBudgetLabor[]) => setLabors(response);
    await getExtraBudgetLabors({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const getSubcontracts = async () => {
    const successCallback = (response: IBudgetSubcontract[]) =>
      setSubcontracts(response);
    await getExtraBudgetSubcontracts({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const getOthers = async () => {
    const successCallback = (response: IBudgetOther[]) => setOthers(response);
    await getExtraBudgetOthers({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const handleOnSettingsSubmit = (data: IExportSettingsExtra) => {
    setExportSettings(data);
    onClose();
  };

  useEffect(() => {
    let abortController = new AbortController();

    getProject();
    getActivity();
    getMaterials();
    getLabors();
    getSubcontracts();
    getOthers();

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
        <DownloadPDF fileName={`Extra-${activity?.activity}-${project?.name}`}>
          <ExtraReport
            project={project!}
            activity={activity!}
            materials={materials}
            labors={labors}
            subcontracts={subcontracts}
            others={others}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            exportSettings={exportSettings}
            pdfMode={true}
          ></ExtraReport>
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
                  <Input
                    name="saleTax"
                    type="number"
                    label={`${appStrings?.ivaTax} (%)`}
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
      {project && activity ? (
        <div className={`${styles.page_container}`}>
          <PDFToolbar />
          <ExtraReport
            project={project}
            activity={activity}
            materials={materials}
            labors={labors}
            subcontracts={subcontracts}
            others={others}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            exportSettings={exportSettings}
            pdfMode={false}
          ></ExtraReport>
        </div>
      ) : (
        <Skeleton className={styles.page_container} height={'95%'} />
      )}
    </>
  );
}
